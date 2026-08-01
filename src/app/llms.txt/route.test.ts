import openapi from "../../../openapi.json";
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

  it("should include the API contract section", async () => {
    const response = await GET();
    const text = await response.text();
    expect(text).toContain("## API v2.0.0");
  });

  it("should include the main resources section", async () => {
    const response = await GET();
    const text = await response.text();
    expect(text).toContain("## Main resources");
    expect(text).toContain("Developer portal");
  });

  it("documents the v2 contribution and projection contracts", async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("## API v2.0.0");
    expect(text).toContain("`contributionMonth`");
    expect(text).toContain("`ordinaryWages`");
    expect(text).toContain("annual OW/prior-AW context");
    expect(text).toContain("starting OA/SA/MA/RA balances");
    expect(text).toContain("`permanentResidentSince`");
    expect(text).toContain("age-dependent SA-to-RA routing");
    expect(text).toContain("Deprecated `cpfLifeEstimate` is null");
  });

  it("distinguishes official policy from SimplyCPF assumptions", async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("official contribution catalogue");
    expect(text).toContain("mark every affected row **assumed**");
    expect(text).toContain("not CPF Board forecasts");
    expect(text).toContain("Per-dataset first-party provenance");
  });

  it("exposes official quarterly declarations without synthetic SGS data", async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("2026 Q3");
    expect(text).toContain("no synthetic monthly SGS series");
    expect(text).not.toContain("sgsYields");
  });

  it("uses the policy cache contract", async () => {
    const response = await GET();

    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    );
  });

  it("publishes the Fumadocs-compatible API v2 OpenAPI contract", () => {
    expect(openapi.openapi).toBe("3.1.0");
    expect(openapi.info.version).toBe("2.0.0");
    expect(openapi.paths).toHaveProperty("/calculate");
    expect(openapi.paths).toHaveProperty("/projection");
    expect(openapi.paths).toHaveProperty("/bhs");
    expect(openapi.paths).toHaveProperty("/retirement-sums");

    const serialised = JSON.stringify(openapi);
    expect(serialised).toContain("contributionMonth");
    expect(serialised).toContain("maxAgeInclusive");
    expect(serialised).toContain("cpfLifeReference");
    expect(serialised).toContain("permanentResidentSince");
    expect(serialised).toContain("netSaSavingsWithdrawnForInvestments");
    expect(serialised).toContain("cohortRetirementSum");
    expect(serialised).toContain("AgeConversionResponse");
    expect(serialised).toContain("AgeConversionCache");
    expect(serialised).toContain("age-dependent");
    expect(serialised).toContain("InterestTrendResponse");
    expect(serialised).toContain("latestPublishedQuarter");
    expect(serialised).toContain(
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    );
    expect(serialised).not.toContain("sgsYields");
  });
});
