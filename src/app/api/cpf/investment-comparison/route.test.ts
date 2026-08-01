import type { NextRequest } from "next/server";
import { POST } from "./route";

const createRequest = (body: unknown): NextRequest => {
  return {
    json: async () => body,
  } as NextRequest;
};

describe("POST /api/cpf/investment-comparison", () => {
  it("should return 400 when principal is not provided", async () => {
    const request = createRequest({
      years: 10,
      scenarios: [{ name: "Test", rate: 5 }],
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("principal is required");
  });

  it("should return 400 when principal is negative", async () => {
    const request = createRequest({
      principal: -1000,
      years: 10,
      scenarios: [{ name: "Test", rate: 5 }],
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("principal must be a non-negative number");
  });

  it("should return 400 when years is not provided", async () => {
    const request = createRequest({
      principal: 10000,
      scenarios: [{ name: "Test", rate: 5 }],
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("years is required");
  });

  it("should return 400 when years exceeds maximum", async () => {
    const request = createRequest({
      principal: 10000,
      years: 51,
      scenarios: [{ name: "Test", rate: 5 }],
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Maximum 50 years allowed");
  });

  it("should return 400 when years is fractional", async () => {
    const request = createRequest({
      principal: 10000,
      years: 10.5,
      scenarios: [{ name: "Test", rate: 5 }],
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("years must be a positive whole number");
  });

  it("should return 400 when scenarios is not provided", async () => {
    const request = createRequest({
      principal: 10000,
      years: 10,
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("scenarios array is required");
  });

  it("should return 400 when scenarios is empty", async () => {
    const request = createRequest({
      principal: 10000,
      years: 10,
      scenarios: [],
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("scenarios array cannot be empty");
  });

  it("should return 400 when scenarios exceed the documented maximum", async () => {
    const request = createRequest({
      principal: 10000,
      years: 10,
      scenarios: Array.from({ length: 11 }, (_, index) => ({
        name: `Scenario ${index + 1}`,
        rate: 5,
      })),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Maximum 10 scenarios allowed");
  });

  it("should return 400 when scenario name is missing", async () => {
    const request = createRequest({
      principal: 10000,
      years: 10,
      scenarios: [{ rate: 5 }],
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Scenario 0: name is required");
  });

  it("should return 400 when scenario rate is missing", async () => {
    const request = createRequest({
      principal: 10000,
      years: 10,
      scenarios: [{ name: "Test" }],
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(
      "Scenario 0: rate is required and must be a number",
    );
  });

  it("should return comparison results with correct structure", async () => {
    const request = createRequest({
      principal: 10000,
      years: 10,
      scenarios: [
        { name: "CPF OA", rate: 2.5 },
        { name: "CPF SA", rate: 4.0 },
      ],
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("input");
    expect(data).toHaveProperty("results");
    expect(data.input).toEqual({ principal: 10000, years: 10 });
    expect(data.results).toHaveLength(2);
  });

  it("should return results with correct properties", async () => {
    const request = createRequest({
      principal: 10000,
      years: 10,
      scenarios: [{ name: "Test", rate: 5 }],
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);

    for (const result of data.results) {
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("rate");
      expect(result).toHaveProperty("finalValue");
      expect(result).toHaveProperty("totalGrowth");
      expect(result).toHaveProperty("growthPercentage");
    }
  });

  it("should calculate compound growth correctly", async () => {
    const principal = 10000;
    const years = 10;
    const rate = 5;
    const expectedFinalValue = principal * (1 + rate / 100) ** years;

    const request = createRequest({
      principal,
      years,
      scenarios: [{ name: "Test", rate }],
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results[0].finalValue).toBeCloseTo(expectedFinalValue, 2);
    expect(data.results[0].totalGrowth).toBeCloseTo(
      expectedFinalValue - principal,
      2,
    );
  });
});
