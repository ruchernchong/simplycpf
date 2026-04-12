import { GET } from "./route";

const createRequest = (sgsYield?: number): Request => {
  const url = new URL("http://localhost/api/cpf/interest-rates/smra");
  if (sgsYield !== undefined) {
    url.searchParams.set("sgsYield", sgsYield.toString());
  }
  return new Request(url.toString());
};

describe("GET /api/cpf/interest-rates/smra", () => {
  it("should return 400 when sgsYield is not provided", async () => {
    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("sgsYield is required");
  });

  it("should return 400 when sgsYield is negative", async () => {
    const request = createRequest(-1);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("sgsYield must be a non-negative number");
  });

  it("should return SMRA rate with correct structure", async () => {
    const request = createRequest(2.5);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("sgsYield");
    expect(data).toHaveProperty("peggedRate");
    expect(data).toHaveProperty("floorApplied");
    expect(data).toHaveProperty("actualRate");
  });

  it.each([
    { sgsYield: 2.5, peggedRate: 3.5, floorApplied: true, actualRate: 4.0 },
    { sgsYield: 3.0, peggedRate: 4.0, floorApplied: false, actualRate: 4.0 },
    { sgsYield: 3.5, peggedRate: 4.5, floorApplied: false, actualRate: 4.5 },
    { sgsYield: 0, peggedRate: 1.0, floorApplied: true, actualRate: 4.0 },
  ])("should calculate correct rates for sgsYield $sgsYield", async ({
    sgsYield,
    peggedRate,
    floorApplied,
    actualRate,
  }) => {
    const request = createRequest(sgsYield);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sgsYield).toBe(sgsYield);
    expect(data.peggedRate).toBe(peggedRate);
    expect(data.floorApplied).toBe(floorApplied);
    expect(data.actualRate).toBe(actualRate);
  });
});
