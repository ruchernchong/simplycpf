import type { NextRequest } from "next/server";
import { POST } from "./route";

function createRequest(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest;
}

const validScenario = {
  contributionMonth: "2026-08",
  ordinaryWages: 5000,
  citizenship: "citizen",
  age: 30,
};

describe("POST /api/cpf/calculate/batch", () => {
  it.each([
    [{}, "scenarios array is required"],
    [{ scenarios: [] }, "scenarios array cannot be empty"],
    [
      { scenarios: Array.from({ length: 101 }, () => validScenario) },
      "Maximum 100 scenarios allowed per request",
    ],
  ])("validates the batch envelope", async (body, error) => {
    const response = await POST(createRequest(body));

    expect(response.status).toBe(422);
    expect((await response.json()).error).toBe(error);
  });

  it("calculates modern and compatibility scenarios", async () => {
    const response = await POST(
      createRequest({
        scenarios: [
          validScenario,
          {
            income: 6000,
            date: "2027-01",
            citizenship: "spr-year2",
            age: 40,
          },
        ],
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].contribution.totalContribution).toBe(1850);
    expect(data[1].schedule.citizenship).toBe("spr-year2");
    expect(data[1].warnings).toContainEqual(
      expect.objectContaining({ code: "legacy-input" }),
    );
  });

  it("identifies the invalid scenario", async () => {
    const response = await POST(
      createRequest({
        scenarios: [validScenario, { ...validScenario, age: -1 }],
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toContain("Scenario 1:");
    expect(data.code).toBe("INVALID_INPUT");
  });

  it("returns 422 for AW without annual context", async () => {
    const response = await POST(
      createRequest({
        scenarios: [{ ...validScenario, additionalWages: 1000 }],
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.code).toBe("AW_CONTEXT_REQUIRED");
  });

  it("returns 404 if any scenario requests an unsupported policy month", async () => {
    const response = await POST(
      createRequest({
        scenarios: [{ ...validScenario, contributionMonth: "2028-01" }],
      }),
    );

    expect(response.status).toBe(404);
    expect((await response.json()).code).toBe("UNSUPPORTED_POLICY_MONTH");
  });
});
