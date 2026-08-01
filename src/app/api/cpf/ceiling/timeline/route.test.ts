import { GET } from "./route";

describe("GET /api/cpf/ceiling/timeline", () => {
  it("returns every sourced 2023-2027 schedule with provenance", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.timeline).toHaveLength(6);
    expect(
      data.timeline.map(
        (entry: { effectiveFrom: string }) => entry.effectiveFrom,
      ),
    ).toEqual([
      "2023-01-01",
      "2023-09-01",
      "2024-01-01",
      "2025-01-01",
      "2026-01-01",
      "2027-01-01",
    ]);
    expect(data.timeline.at(-1).effectiveTo).toBe("2027-12-31");
    expect(data.policy.version).toBe("2023-2027");
    expect(data.policy.verifiedAt).toBe("2026-08-01");
    expect(response.headers.get("cache-control")).toContain("s-maxage=86400");
  });
});
