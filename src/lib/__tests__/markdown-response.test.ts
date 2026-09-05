import { markdownNotFound, preferredPageType } from "../markdown-response";

describe("page content negotiation", () => {
  it.each([
    [null, "html"],
    ["*/*", "html"],
    ["text/html", "html"],
    ["text/markdown", "markdown"],
    ["TEXT/MARKDOWN; charset=utf-8", "markdown"],
    ["text/html;q=0.4, text/markdown;q=0.9", "markdown"],
    ["text/html;q=1, text/markdown;q=0.1", "html"],
    ["text/markdown;q=0, */*;q=1", "html"],
    ["text/html;q=0, text/*;q=0.5", "markdown"],
    ["text/html;q=0, text/markdown;q=0, */*;q=1", null],
    ["application/json", null],
    ["text/markdown;q=invalid", null],
    ["text/markdown;q=2", null],
    ["text/markdown;q=-1", null],
    ["text/html, text/markdown", "markdown"],
  ])("negotiates %s as %s", (accept, expected) => {
    expect(preferredPageType(accept)).toBe(expected);
  });

  it("returns a genuine Markdown 404 with recovery links", async () => {
    const response = markdownNotFound();
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(response.headers.get("vary")).toBe("Accept, Accept-Encoding");
    expect(response.headers.get("x-robots-tag")).toBe("noindex");
    const body = await response.text();
    for (const path of ["/sitemap.xml", "/llms.txt", "/docs", "/openapi.json"])
      expect(body).toContain(path);
  });
});
