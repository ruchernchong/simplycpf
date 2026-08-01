import { GET } from "./route";

const createRequest = (
  averageSgsYield?: number,
  key: "averageSgsYield" | "sgsYield" = "averageSgsYield",
): Request => {
  const url = new URL("http://localhost/api/cpf/interest-rates/smra");
  if (averageSgsYield !== undefined) {
    url.searchParams.set(key, averageSgsYield.toString());
  }
  return new Request(url.toString());
};

describe("GET /api/cpf/interest-rates/smra", () => {
  it("returns 400 when averageSgsYield is not provided", async () => {
    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("averageSgsYield is required");
  });

  it("returns 400 when averageSgsYield is negative", async () => {
    const request = createRequest(-1);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(
      "averageSgsYield must be a non-negative number",
    );
  });

  it("returns the documented SMRA methodology", async () => {
    const request = createRequest(2.5);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("averageSgsYield");
    expect(data).toHaveProperty("peggedRate");
    expect(data).toHaveProperty("floorApplied");
    expect(data).toHaveProperty("actualRate");
    expect(data).toHaveProperty("methodology");
    expect(data.warnings).toEqual([]);
  });

  it.each([
    {
      averageSgsYield: 2.5,
      peggedRate: 3.5,
      floorApplied: true,
      actualRate: 4.0,
    },
    {
      averageSgsYield: 3.0,
      peggedRate: 4.0,
      floorApplied: false,
      actualRate: 4.0,
    },
    {
      averageSgsYield: 3.5,
      peggedRate: 4.5,
      floorApplied: false,
      actualRate: 4.5,
    },
    {
      averageSgsYield: 0,
      peggedRate: 1.0,
      floorApplied: true,
      actualRate: 4.0,
    },
  ])("calculates rates for a $averageSgsYield% average", async ({
    averageSgsYield,
    peggedRate,
    floorApplied,
    actualRate,
  }) => {
    const request = createRequest(averageSgsYield);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.averageSgsYield).toBe(averageSgsYield);
    expect(data.peggedRate).toBe(peggedRate);
    expect(data.floorApplied).toBe(floorApplied);
    expect(data.actualRate).toBe(actualRate);
  });

  it("accepts the deprecated sgsYield alias for one compatibility cycle", async () => {
    const request = createRequest(2.5, "sgsYield");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.averageSgsYield).toBe(2.5);
    expect(data.warnings).toContain(
      "sgsYield is deprecated; use averageSgsYield",
    );
  });
});
