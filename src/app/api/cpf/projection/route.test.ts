import type { NextRequest } from "next/server";
import { POST } from "./route";

const createRequest = (body: unknown): NextRequest => {
  return {
    json: async () => body,
  } as unknown as NextRequest;
};

describe("POST /api/cpf/projection", () => {
  it("should return 400 when income is not provided for legacy requests", async () => {
    const request = createRequest({ age: 30, years: 5 });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("income is required");
  });

  it("should return 400 when income is negative for legacy requests", async () => {
    const request = createRequest({ income: -1000, age: 30, years: 5 });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("income must be a non-negative number");
  });

  it("should return 400 when age is not provided for legacy requests", async () => {
    const request = createRequest({ income: 5000, years: 5 });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("age is required");
  });

  it("should return 400 when age is negative for legacy requests", async () => {
    const request = createRequest({ income: 5000, age: -1, years: 5 });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("age must be a non-negative number");
  });

  it("should return 400 when years is not provided for legacy requests", async () => {
    const request = createRequest({ income: 5000, age: 30 });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("years is required");
  });

  it("should return 400 when years is less than 1 for legacy requests", async () => {
    const request = createRequest({ income: 5000, age: 30, years: 0 });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("years must be a positive number");
  });

  it("should return 400 when years exceeds maximum", async () => {
    const request = createRequest({ income: 5000, age: 30, years: 51 });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Maximum 50 years allowed");
  });

  it("should return legacy projections and the full projection result", async () => {
    const request = createRequest({ income: 5000, age: 30, years: 5 });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.input).toEqual({ income: 5000, age: 30, years: 5 });
    expect(data.projectionInput).toMatchObject({
      monthlyIncome: 5000,
      startAge: 30,
      endAge: 34,
      citizenship: "citizen",
    });
    expect(data.projections).toHaveLength(5);
    expect(data.yearlyBalances).toHaveLength(5);
    expect(data).toHaveProperty("milestones");
    expect(data).toHaveProperty("cpfLifeEstimate");
    expect(data).toHaveProperty("totalContributed");
    expect(data).toHaveProperty("totalInterestEarned");
  });

  it("should keep the legacy projection structure", async () => {
    const request = createRequest({ income: 5000, age: 30, years: 2 });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);

    for (const projection of data.projections) {
      expect(projection).toHaveProperty("year");
      expect(projection).toHaveProperty("age");
      expect(projection).toHaveProperty("ageGroup");
      expect(projection).toHaveProperty("contribution");
      expect(projection).toHaveProperty("cumulative");
      expect(projection.contribution).toHaveProperty("employee");
      expect(projection.contribution).toHaveProperty("employer");
      expect(projection.contribution).toHaveProperty("totalContribution");
      expect(projection.cumulative).toHaveProperty("employee");
      expect(projection.cumulative).toHaveProperty("employer");
      expect(projection.cumulative).toHaveProperty("totalContribution");
    }
  });

  it("should support the full projection request shape", async () => {
    const request = createRequest({
      monthlyIncome: 5000,
      birthDate: "01/1995",
      endAge: 65,
      housingWithdrawal: 500,
      voluntaryTopUp: {
        amount: 8000,
        account: "SA",
        frequency: "yearly",
      },
      oaToSaTransfer: {
        amount: 10000,
        timing: "now",
      },
      citizenship: "citizen",
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.input).toMatchObject({
      monthlyIncome: 5000,
      birthDate: "01/1995",
      endAge: 65,
      housingWithdrawal: 500,
      citizenship: "citizen",
    });
    expect(data.yearlyBalances.length).toBeGreaterThan(0);
    expect(data.milestones.age55).toBeDefined();
    expect(data.cpfLifeEstimate).toHaveProperty("standardMonthly");
  });

  it("should return 400 when monthlyIncome is missing for full requests", async () => {
    const request = createRequest({ birthDate: "01/1995" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("monthlyIncome is required");
  });

  it("should return 400 when neither birthDate nor startAge is provided", async () => {
    const request = createRequest({ monthlyIncome: 5000 });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("birthDate or startAge is required");
  });

  it("should return 400 when endAge is below startAge", async () => {
    const request = createRequest({
      monthlyIncome: 5000,
      startAge: 40,
      endAge: 39,
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("endAge must be greater than or equal to startAge");
  });

  it("should return 400 when the projection exceeds the maximum supported years", async () => {
    const request = createRequest({
      monthlyIncome: 5000,
      startAge: 20,
      endAge: 80,
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Maximum 50 years allowed");
  });

  it("should return 400 for invalid housing withdrawal values", async () => {
    const request = createRequest({
      monthlyIncome: 5000,
      birthDate: "01/1995",
      housingWithdrawal: -100,
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("housingWithdrawal must be a non-negative number");
  });

  it("should return 400 for invalid citizenship values", async () => {
    const request = createRequest({
      monthlyIncome: 5000,
      birthDate: "01/1995",
      citizenship: "pr",
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(
      "citizenship must be citizen, spr-year1, spr-year2, or spr-year3-plus",
    );
  });

  it("should return 400 when voluntaryTopUp is not an object", async () => {
    const request = createRequest({
      monthlyIncome: 5000,
      birthDate: "01/1995",
      voluntaryTopUp: "8000",
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("voluntaryTopUp must be an object");
  });

  it("should return 400 for invalid voluntary top-up frequency", async () => {
    const request = createRequest({
      monthlyIncome: 5000,
      birthDate: "01/1995",
      voluntaryTopUp: {
        amount: 8000,
        account: "SA",
        frequency: "weekly",
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(
      "voluntaryTopUp.frequency must be monthly or yearly",
    );
  });

  it("should return 400 when oaToSaTransfer is not an object", async () => {
    const request = createRequest({
      monthlyIncome: 5000,
      birthDate: "01/1995",
      oaToSaTransfer: "10000",
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("oaToSaTransfer must be an object");
  });

  it("should return 400 for invalid OA to SA transfer amount", async () => {
    const request = createRequest({
      monthlyIncome: 5000,
      birthDate: "01/1995",
      oaToSaTransfer: {
        amount: 0,
        timing: "now",
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("oaToSaTransfer.amount must be a positive number");
  });

  it("should return 400 for invalid voluntary top-up payloads", async () => {
    const request = createRequest({
      monthlyIncome: 5000,
      birthDate: "01/1995",
      voluntaryTopUp: {
        amount: 8000,
        account: "OA",
        frequency: "yearly",
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("voluntaryTopUp.account must be SA, MA, or RA");
  });

  it("should return 400 for invalid OA to SA transfer payloads", async () => {
    const request = createRequest({
      monthlyIncome: 5000,
      birthDate: "01/1995",
      oaToSaTransfer: {
        amount: 10000,
        timing: "later",
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("oaToSaTransfer.timing must be now or yearly");
  });

  it("should return 400 for invalid JSON body", async () => {
    const request = {
      json: async () => {
        throw new Error("Invalid JSON");
      },
    } as unknown as NextRequest;
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
  });
});
