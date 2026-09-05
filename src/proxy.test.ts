import { NextRequest } from "next/server";
import { proxy } from "./proxy";

const { limit } = vi.hoisted(() => ({ limit: vi.fn() }));
vi.mock("@upstash/redis", () => ({ Redis: { fromEnv: vi.fn() } }));
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn();
    limit = limit;
  },
}));

describe("agent-aware proxy", () => {
  beforeEach(() =>
    limit.mockResolvedValue({ success: true, pending: Promise.resolve() }),
  );
  it.each([
    ["/", "text/markdown", "/index.md"],
    ["/docs", "text/markdown", "/docs/llms.mdx"],
    [
      "/docs/getting-started",
      "text/markdown",
      "/docs/llms.mdx/getting-started",
    ],
    ["/", "text/html", null],
    ["/", "text/html;q=1,text/markdown;q=0.2", null],
    ["/docs/llms.mdx", "text/markdown", null],
    ["/api/cpf/ceiling", "text/markdown", null],
  ])("negotiates %s with %s", async (path, accept, rewrite) => {
    const response = await proxy(
      new NextRequest(`https://simplycpf.com${path}`, { headers: { accept } }),
      { waitUntil: vi.fn() },
    );
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      rewrite ? `https://simplycpf.com${rewrite}` : null,
    );
    expect(response.headers.get("vary")).toContain("Accept");
    expect(response.headers.get("content-security-policy")).toBeTruthy();
    expect(response.headers.get("link")).toContain("/openapi.json");
  });
  it("returns 406 for unsupported page representations", async () => {
    const response = await proxy(
      new NextRequest("https://simplycpf.com", {
        headers: { accept: "application/json" },
      }),
      { waitUntil: vi.fn() },
    );
    expect(response.status).toBe(406);
    expect(response.headers.get("vary")).toContain("Accept");
  });
  it("preserves React server component navigation", async () => {
    const response = await proxy(
      new NextRequest("https://simplycpf.com", {
        headers: { accept: "text/x-component", rsc: "1" },
      }),
      { waitUntil: vi.fn() },
    );
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
  it("retains API rate limiting", async () => {
    limit.mockResolvedValueOnce({ success: false, pending: Promise.resolve() });
    const response = await proxy(
      new NextRequest("https://simplycpf.com/api/cpf/ceiling"),
      { waitUntil: vi.fn() },
    );
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: "Rate limit exceeded" });
  });
});
