import type { NextRequest } from "next/server";
import { vi } from "vitest";
import { POST } from "./route";

vi.mock("@/constants", () => ({
  CPF_INCOME_CEILING: {
    "2023-01-01": 6000,
    "2023-09-01": 6300,
    "2024-01-01": 6800,
    "2025-01-01": 7400,
    "2026-01-01": 8000,
  },
  CPF_INCOME_CEILING_BEFORE_SEPT_2023: 6000,
}));

describe("POST /api/cpf/calculate", () => {
  const createRequest = (body: unknown) => {
    return {
      json: async () => body,
    } as unknown as NextRequest;
  };

  it("should calculate CPF contribution with income only", async () => {
    const req = createRequest({ income: 5000, date: "2025-01-01" });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("contribution");
    expect(data).toHaveProperty("distribution");
    expect(data).toHaveProperty("afterCpfContribution");
    expect(data.contribution.employee).toBe(1000);
    expect(data.contribution.employer).toBe(850);
    expect(data.contribution.totalContribution).toBe(1850);
  });

  it("should calculate CPF contribution with age parameter", async () => {
    const req = createRequest({ income: 5000, date: "2025-01-01", age: 30 });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.distribution).toHaveProperty("OA");
    expect(data.distribution).toHaveProperty("SA");
    expect(data.distribution).toHaveProperty("MA");
  });

  // Senior rates and allocations per the CPF Board tables effective 1 Jan 2026.
  it.each([
    // age, employee, employer, total, OA, RA/SA, MA
    [58, 900, 800, 1700, 600.1, 574.94, 524.96],
    [62, 625, 625, 1250, 175, 550, 525],
    [67, 375, 450, 825, 50.08, 249.97, 524.95],
  ])("applies the 1 Jan 2026 senior rates at age %i", async (age, employee, employer, total, oa, sa, ma) => {
    const req = createRequest({ income: 5000, date: "2026-01-01", age });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.contribution.employee).toBe(employee);
    expect(data.contribution.employer).toBe(employer);
    expect(data.contribution.totalContribution).toBe(total);
    expect(data.distribution.OA).toBe(oa);
    expect(data.distribution.SA).toBe(sa);
    expect(data.distribution.MA).toBe(ma);
  });

  it("should cap income at ceiling", async () => {
    const req = createRequest({ income: 10000, date: "2025-01-01" });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.contribution.employee).toBe(1480);
    expect(data.contribution.employer).toBe(1258);
  });

  it("should return 400 if income is missing", async () => {
    const req = createRequest({});
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("income is required");
  });

  it("should return 400 if income is negative", async () => {
    const req = createRequest({ income: -1000 });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("income must be a positive number");
  });

  it("should return 400 if age is negative", async () => {
    const req = createRequest({ income: 5000, age: -5 });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("age must be a positive number");
  });

  it("should return 400 for invalid JSON body", async () => {
    const req = {
      json: async () => {
        throw new Error("Invalid JSON");
      },
    } as unknown as NextRequest;
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
  });
});
