import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";
import { type NextProxy, NextResponse } from "next/server";

const { rewrite: rewriteLLM } = rewritePath(
  "/developer/*path",
  "/developer/llms.mdx/*path",
);

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

export const proxy: NextProxy = async (request, event) => {
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

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  setSecurityHeaders(response);

  if (isMarkdownPreferred(request)) {
    const result = rewriteLLM(request.nextUrl.pathname);
    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl));
    }
  }

  return response;
};
