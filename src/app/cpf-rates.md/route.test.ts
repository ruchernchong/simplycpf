import { GET } from "./route";

describe("GET /cpf-rates.md", () => {
  it("returns source-backed markdown with the v2 contract", async () => {
    const response = await GET();
    const text = await response.text();

    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(text).toContain("SimplyCPF API contract v2.0.0");
    expect(text).toContain("## Per-dataset provenance");
    expect(text).toContain("CPF Board");
    expect(text).toContain("Verified 2026-08-01");
  });

  it("publishes all sourced contribution schedules and wage rules", async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("### cpf-2023-jan-aug");
    expect(text).toContain("### cpf-2027");
    expect(text).toContain("Above S$50 to S$500");
    expect(text).toContain("Above S$500 to S$750");
    expect(text).toContain(
      "Employer share is the rounded total minus employee share",
    );
    expect(text).toContain(
      "MA first, retirement savings second, and OA as the exact remainder",
    );
  });

  it("uses official quarterly declarations and exact CPF LIFE references", async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("2026 Q3");
    expect(text).toContain("There is no synthetic monthly SGS series");
    expect(text).not.toContain("sgsYields");
    expect(text).toContain("CPF LIFE 2026 reference rows");
    expect(text).toContain("does not interpolate");
    expect(text).toContain("not a minimum joining balance or payout threshold");
  });

  it("documents explicit future assumptions and migration errors", async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("marks every affected year **assumed**");
    expect(text).toContain("`cpfLifeEstimate` is always null");
    expect(text).toContain(
      "Unsupported official policy months or years return 404",
    );
    expect(text).toContain("Missing AW context");
  });

  it("uses 24-hour edge caching without immutable", async () => {
    const response = await GET();
    const cacheControl = response.headers.get("Cache-Control");

    expect(cacheControl).toBe(
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    );
    expect(cacheControl).not.toContain("immutable");
  });
});
