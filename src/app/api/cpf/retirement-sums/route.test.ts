import { GET } from "./route";

describe("GET /api/cpf/retirement-sums", () => {
  it("should return known retirement sums by year", async () => {
    const response = await GET(
      new Request("https://simplycpf.localhost/api/cpf/retirement-sums"),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("years");
    expect(data.years).toHaveProperty("2026");
    expect(data.years["2026"]).toEqual({
      brs: 110200,
      frs: 220400,
      ers: 440800,
    });
  });

  it("should return a single year when year query is provided", async () => {
    const response = await GET(
      new Request(
        "https://simplycpf.localhost/api/cpf/retirement-sums?year=2026",
      ),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      year: 2026,
      brs: 110200,
      frs: 220400,
      ers: 440800,
    });
  });

  it("should return 400 for invalid years", async () => {
    const response = await GET(
      new Request(
        "https://simplycpf.localhost/api/cpf/retirement-sums?year=abc",
      ),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("year must be a valid year");
  });
});
