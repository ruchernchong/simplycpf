import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/(docs)/lib/source", () => ({
  source: { getPages: () => [{ url: "/docs" }] },
}));

vi.mock("@/app/(docs)/lib/get-llm-text", () => ({
  getLLMText: async () => "# Generated docs",
}));

import { GET, revalidate } from "./route";

describe("GET /docs/llms-full.txt", () => {
  it("uses the 24-hour policy cache with stale revalidation", async () => {
    const response = await GET();

    expect(revalidate).toBe(86400);
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    );
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
    expect(await response.text()).toBe("# Generated docs");
  });
});
