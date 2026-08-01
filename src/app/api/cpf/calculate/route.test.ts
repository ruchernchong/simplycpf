import type { NextRequest } from "next/server";
import { POST } from "./route";

function createRequest(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest;
}

describe("POST /api/cpf/calculate", () => {
  it("calculates a modern, source-backed contribution request", async () => {
    const response = await POST(
      createRequest({
        contributionMonth: "2026-08",
        ordinaryWages: 5000,
        citizenship: "citizen",
        age: 30,
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.contribution).toEqual({
      employee: 1000,
      employer: 850,
      totalContribution: 1850,
    });
    expect(data.wageBand).toBe("full-rates");
    expect(data.schedule.id).toBe("cpf-2026");
    expect(data.schedule.status).toBe("official");
    expect(data.policy.contribution.verifiedAt).toBe("2026-08-01");
  });

  it.each([
    [58, 900, 800, 1700, 600.1, 574.94, 524.96],
    [62, 625, 625, 1250, 175, 550, 525],
    [67, 375, 450, 825, 50.07, 249.98, 524.95],
  ])("applies the official 2026 senior rates at age %i", async (age, employee, employer, total, oa, ra, ma) => {
    const response = await POST(
      createRequest({
        contributionMonth: "2026-01",
        ordinaryWages: 5000,
        citizenship: "citizen",
        age,
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.contribution).toEqual({
      employee,
      employer,
      totalContribution: total,
    });
    expect(data.distribution).toEqual({ OA: oa, RA: ra, MA: ma });
    expect(data.routing.selected).toBe("undetermined");
    expect(data.routing.branches.afterFullRetirementSum.RA).toBe(0);
  });

  it("caps Ordinary Wages at the resolved monthly ceiling", async () => {
    const response = await POST(
      createRequest({
        contributionMonth: "2025-01",
        ordinaryWages: 10000,
        citizenship: "citizen",
        age: 30,
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.subjectWages.ordinaryWages).toBe(7400);
    expect(data.contribution.employee).toBe(1480);
    expect(data.contribution.employer).toBe(1258);
  });

  it("accepts income and date for one compatibility cycle with a warning", async () => {
    const response = await POST(
      createRequest({
        income: 5000,
        date: "2026-08-01",
        citizenship: "citizen",
        age: 30,
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.warnings).toContainEqual(
      expect.objectContaining({ code: "legacy-input" }),
    );
  });

  it("returns 422 rather than guessing an Additional Wage ceiling", async () => {
    const response = await POST(
      createRequest({
        contributionMonth: "2026-08",
        ordinaryWages: 5000,
        additionalWages: 1000,
        citizenship: "citizen",
        age: 30,
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.code).toBe("AW_CONTEXT_REQUIRED");
  });

  it("returns 404 for an unsupported policy month", async () => {
    const response = await POST(
      createRequest({
        contributionMonth: "2028-01",
        ordinaryWages: 5000,
        citizenship: "citizen",
        age: 30,
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.code).toBe("UNSUPPORTED_POLICY_MONTH");
  });

  it.each([
    [{}, "ordinaryWages is required and must be a number."],
    [
      { ordinaryWages: 5000 },
      "contributionMonth is required and must be a string.",
    ],
    [
      { ordinaryWages: 5000, contributionMonth: "2026-08" },
      "citizenship must be citizen, spr-year1, spr-year2, or spr-year3-plus.",
    ],
  ])("returns 422 for invalid input", async (body, message) => {
    const response = await POST(createRequest(body));
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBe(message);
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await POST({
      json: async () => {
        throw new Error("Invalid JSON");
      },
    } as unknown as NextRequest);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid request body" });
  });
});
