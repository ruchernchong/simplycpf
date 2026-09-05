import { BASE_URL } from "@/config";

export function markdownResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept, Accept-Encoding",
      Link: `<${BASE_URL}/llms.txt>; rel="describedby"`,
      ...(status === 404 ? { "X-Robots-Tag": "noindex" } : {}),
    },
  });
}

export function markdownNotFound(): Response {
  return markdownResponse(
    `# 404 — Page not found\n\nThis URL does not exist on SimplyCPF. Find a valid page or API operation here:\n\n- [Sitemap](${BASE_URL}/sitemap.xml)\n- [Agent guidance](${BASE_URL}/llms.txt)\n- [Documentation](${BASE_URL}/docs)\n- [OpenAPI specification](${BASE_URL}/openapi.json)\n`,
    404,
  );
}

/** RFC 9110: the most specific media range determines each representation's q. */
export function preferredPageType(
  accept: string | null,
): "html" | "markdown" | null {
  const ranges = (accept || "*/*").split(",").map((part) => {
    const [media, ...parameters] = part.trim().toLowerCase().split(";");
    const quality = parameters.find((parameter) =>
      parameter.trim().startsWith("q="),
    );
    const value = quality ? Number(quality.trim().slice(2)) : 1;
    return {
      media: media.trim(),
      quality: Number.isFinite(value) && value >= 0 && value <= 1 ? value : 0,
    };
  });
  function qualityFor(type: string): number {
    for (const media of [type, "text/*", "*/*"]) {
      const matches = ranges.filter((range) => range.media === media);
      if (matches.length)
        return Math.max(...matches.map((range) => range.quality));
    }
    return 0;
  }
  const html = qualityFor("text/html");
  const markdown = qualityFor("text/markdown");
  if (!html && !markdown) return null;
  return markdown > html ||
    (markdown === html &&
      ranges.some(
        (range) => range.media === "text/markdown" && range.quality > 0,
      ))
    ? "markdown"
    : "html";
}
