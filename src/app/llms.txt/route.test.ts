import { GET } from "./route";

describe("GET /llms.txt", () => {
  it("should return a text/plain response", async () => {
    const response = await GET();
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
  });

  it("should include the title in the response", async () => {
    const response = await GET();
    const text = await response.text();
    expect(text).toContain("# SimplyCPF");
  });

  it("should include API endpoints section", async () => {
    const response = await GET();
    const text = await response.text();
    expect(text).toContain("## API Endpoints");
  });

  it("should include developer portal section", async () => {
    const response = await GET();
    const text = await response.text();
    expect(text).toContain("## Developer Portal");
  });
});

describe("agent instructions", () => {
  it("follows llms.txt heading and file-list structure", async () => {
    const text = await (await GET()).text();
    expect(text).toMatch(/^# SimplyCPF\n\n> /);
    const sections = text.split(/^## /m).slice(1);
    for (const section of sections) {
      const lines = section.split("\n").slice(1).filter(Boolean);
      expect(lines.length).toBeGreaterThan(0);
      for (const line of lines)
        expect(line).toMatch(/^- \[.+\]\(https?:\/\/[^)]+\): /);
    }
  });
  it("explains use cases, methods, limits and discovery", async () => {
    const text = await (await GET()).text();
    for (const guidance of [
      "## When to use SimplyCPF",
      "POST /api/cpf/calculate",
      "/openapi.json",
      "10 per 10 seconds",
      "429",
      "graduated PR",
      "Accept: text/markdown",
    ])
      expect(text).toContain(guidance);
  });
});
