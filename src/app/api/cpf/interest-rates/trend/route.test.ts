import { GET } from "./route";

describe("GET /api/cpf/interest-rates/trend", () => {
  it("returns official quarterly observations", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.observations).toHaveLength(15);
    expect(data.methodology.status).toBe("official");
    expect(data.policy).toMatchObject({
      dataset: "cpf-interest-rates",
      status: "official",
      verifiedAt: "2026-08-01",
    });
  });

  it("returns source and provenance for every observation", async () => {
    const response = await GET();
    const data = await response.json();

    for (const entry of data.observations) {
      expect(entry).toHaveProperty("quarter");
      expect(entry).toHaveProperty("effectiveFrom");
      expect(entry).toHaveProperty("effectiveTo");
      expect(entry).toHaveProperty("oaRate");
      expect(entry).toHaveProperty("saRate");
      expect(entry).toHaveProperty("maRate");
      expect(entry).toHaveProperty("raRate");
      expect(entry).toHaveProperty("sourceUrl");
      expect(entry.status).toBe("official");
      expect(entry.verifiedAt).toBe("2026-08-01");
      expect(entry).not.toHaveProperty("sgsYield");
    }
  });

  it("ends with the published 2026 Q3 declaration", async () => {
    const response = await GET();
    const data = await response.json();
    const latest = data.observations.at(-1);

    expect(latest.quarter).toBe("2026 Q3");
    expect(latest.oaRate).toBe(2.5);
    expect(latest.saRate).toBe(4);
    expect(latest.maRate).toBe(4);
    expect(latest.raRate).toBe(4);
  });
});
