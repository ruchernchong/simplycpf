import { GET } from "./route";

describe("GET /api/cpf/bhs", () => {
  it("should return known BHS values by year", async () => {
    const response = await GET(
      new Request("https://simplycpf.localhost/api/cpf/bhs"),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("years");
    expect(data.years).toHaveProperty("2026");
    expect(data.years["2026"]).toBe(79000);
    expect(data.latestPublishedYear).toBe(2026);
    expect(data.metadata.status).toBe("official");
    expect(data.metadata.verifiedAt).toBe("2026-08-01");
  });

  it("should return a single year when year query is provided", async () => {
    const response = await GET(
      new Request("https://simplycpf.localhost/api/cpf/bhs?year=2026"),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      year: 2026,
      bhs: 79000,
      status: "official",
      metadata: expect.objectContaining({
        dataset: "cpf-basic-healthcare-sum",
        status: "official",
        version: "2026",
      }),
    });
  });

  it("returns 422 for malformed years", async () => {
    const response = await GET(
      new Request("https://simplycpf.localhost/api/cpf/bhs?year=abc"),
    );
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBe("year must be a valid year");
  });

  it.each([
    2015, 2027, 2035,
  ])("returns 404 instead of fabricating BHS for %s", async (year) => {
    const response = await GET(
      new Request(`https://simplycpf.localhost/api/cpf/bhs?year=${year}`),
    );
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain(String(year));
    expect(data.supportedYears).toContain(2026);
  });

  it("uses the revalidating policy cache", async () => {
    const response = await GET(
      new Request("https://simplycpf.localhost/api/cpf/bhs"),
    );

    expect(response.headers.get("cache-control")).toBe(
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    );
  });
});
