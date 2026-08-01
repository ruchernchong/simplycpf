import { GET } from "./route";

describe("GET /api/cpf/interest-rates", () => {
  it("returns official quarterly declarations and methodology", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("quarterlyRates");
    expect(data).toHaveProperty("methodology");
    expect(data).toHaveProperty("metadata");
    expect(data).not.toHaveProperty("sgsYields");
    expect(data.metadata).toEqual({
      status: "official",
      verifiedAt: "2026-08-01",
      latestPublishedQuarter: "2026 Q3",
    });
  });

  it("should return quarterly rates with correct structure", async () => {
    const response = await GET();
    const data = await response.json();

    expect(Array.isArray(data.quarterlyRates)).toBe(true);
    expect(data.quarterlyRates.length).toBeGreaterThan(0);

    for (const rate of data.quarterlyRates) {
      expect(rate).toHaveProperty("quarter");
      expect(rate).toHaveProperty("oa");
      expect(rate).toHaveProperty("sa");
      expect(rate).toHaveProperty("ma");
      expect(rate).toHaveProperty("ra");
      expect(rate).toHaveProperty("effectiveFrom");
      expect(rate).toHaveProperty("effectiveTo");
      expect(rate).toHaveProperty("sourceUrl");
      expect(rate.status).toBe("official");
      expect(rate.verifiedAt).toBe("2026-08-01");
    }
  });

  it("includes the latest published 2026 Q3 declaration", async () => {
    const response = await GET();
    const data = await response.json();
    const latest = data.quarterlyRates.at(-1);

    expect(latest.quarter).toBe("2026 Q3");
    expect(latest.oa).toBe(2.5);
    expect(latest.sa).toBe(4);
    expect(latest.ma).toBe(4);
    expect(latest.ra).toBe(4);
  });

  it("uses a revalidating policy-data cache", async () => {
    const response = await GET();

    expect(response.headers.get("cache-control")).toBe(
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    );
  });
});
