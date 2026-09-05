import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";
import { preferredPageType } from "@/lib/markdown-response";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
];

const getClientIp = (headers: Headers): string => {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    headers.get("cf-connecting-ip")?.trim() ||
    "anonymous"
  );
};

const shouldRateLimit = (pathname: string): boolean => {
  return pathname.startsWith("/api/");
};

const setSecurityHeaders = (response: NextResponse): void => {
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' va.vercel-scripts.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    connect-src 'self' vitals.vercel-insights.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
`;

  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, " ")
    .trim();

  for (const { key, value } of securityHeaders) {
    response.headers.set(key, value);
  }

  response.headers.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue,
  );
};

export async function proxy(
  request: NextRequest,
  event: Pick<NextFetchEvent, "waitUntil">,
): Promise<NextResponse> {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  if (shouldRateLimit(request.nextUrl.pathname)) {
    const identifier = getClientIp(request.headers);
    const { success, pending } = await ratelimit.limit(identifier);

    event.waitUntil(pending);

    if (!success) {
      const rateLimitedResponse = NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );

      setSecurityHeaders(rateLimitedResponse);
      return rateLimitedResponse;
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const pathname = request.nextUrl.pathname;
  const negotiatedPage =
    pathname === "/" ||
    pathname === "/docs" ||
    (pathname.startsWith("/docs/") &&
      !pathname.includes(".") &&
      !pathname.startsWith("/docs/og/"));
  // RSC requests are a separate framework representation, not HTML/Markdown.
  const isRsc = request.headers.get("rsc") === "1";
  const preferred = preferredPageType(request.headers.get("accept"));
  // A fallback rewrite handles only URLs that Next.js could not resolve.
  requestHeaders.set(
    "x-simplycpf-markdown",
    !isRsc &&
      preferred === "markdown" &&
      ["GET", "HEAD"].includes(request.method)
      ? "1"
      : "0",
  );
  let response: NextResponse;
  if (
    negotiatedPage &&
    !isRsc &&
    ["GET", "HEAD"].includes(request.method) &&
    preferred === null
  ) {
    response = new NextResponse(null, { status: 406 });
  } else if (
    negotiatedPage &&
    !isRsc &&
    ["GET", "HEAD"].includes(request.method) &&
    preferred === "markdown"
  ) {
    const destination =
      pathname === "/" ? "/index.md" : `/docs/llms.mdx${pathname.slice(5)}`;
    response = NextResponse.rewrite(new URL(destination, request.nextUrl), {
      request: { headers: requestHeaders },
    });
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  }
  response.headers.append("Vary", "Accept");
  response.headers.append("Vary", "Accept-Encoding");
  response.headers.append(
    "Link",
    '</llms.txt>; rel="describedby", </openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"',
  );
  if (pathname === "/")
    response.headers.append(
      "Link",
      '</index.md>; rel="alternate"; type="text/markdown"',
    );
  setSecurityHeaders(response);
  return response;
}
