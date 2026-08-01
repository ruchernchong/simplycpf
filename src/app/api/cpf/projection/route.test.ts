import type { NextRequest } from "next/server";
import { POST } from "./route";

function createRequest(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest;
}

const v2Input = {
  monthlyIncome: 5000,
  birthDate: "08/1996",
  startMonth: "2026-08",
  initialBalances: { oa: 1000, sa: 2000, ma: 3000, ra: 0 },
  endAge: 30,
  citizenship: "citizen",
};

describe("POST /api/cpf/projection", () => {
  it("returns a monthly-ledger projection with policy provenance", async () => {
    const response = await POST(createRequest(v2Input));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.input).toMatchObject(v2Input);
    expect(data.yearlyBalances.length).toBeGreaterThan(0);
    expect(data.yearlyBalances[0].month).toMatch(/^\d{4}-\d{2}$/);
    expect(data.yearlyBalances[0].policy.contribution.status).toBe("official");
    expect(data.yearlyBalances[0].policy.status).toBe("assumed");
    expect(data.yearlyBalances[0].policy.interest.status).toBe("assumed");
    expect(data.yearlyBalances[0].policy.contribution.verifiedAt).toBe(
      "2026-08-01",
    );
    expect(data.assumptions.salary).toBe("fixed-monthly-ordinary-wages");
  });

  it("returns exact CPF LIFE references and a null deprecated estimate", async () => {
    const response = await POST(createRequest(v2Input));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.cpfLifeReference.referenceYear).toBe(2026);
    expect(data.cpfLifeReference.rows).toHaveLength(6);
    expect(data.cpfLifeEstimate).toBeNull();
    expect(data.warnings).toContainEqual(
      expect.objectContaining({ code: "cpf-life-estimate-removed" }),
    );
  });

  it("accepts age-aware retirement transfers and top-ups", async () => {
    const response = await POST(
      createRequest({
        ...v2Input,
        voluntaryTopUp: {
          amount: 100,
          account: "retirement",
          frequency: "monthly",
        },
        retirementTransfer: { amount: 200, timing: "now" },
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.yearlyBalances[0].voluntaryTopUp).toBeGreaterThan(0);
    expect(data.yearlyBalances[0].retirementTransfer).toBe(200);
  });

  it("applies Additional Wages only in explicitly supplied months", async () => {
    const additionalWages = [
      {
        contributionMonth: "2026-12",
        amount: 1_000,
        additionalWageCeilingContext: {
          remainingAdditionalWageCeiling: 102_000,
        },
      },
    ];
    const response = await POST(createRequest({ ...v2Input, additionalWages }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.input.additionalWages).toEqual(additionalWages);
    expect(data.yearlyBalances[0].contributions.total).toBe(9_620);
    expect(data.assumptions.additionalWages).toBe(
      "explicit-dated-payments-only",
    );
  });

  it("returns 422 for incomplete or ambiguous Additional Wage context", async () => {
    const incomplete = await POST(
      createRequest({
        ...v2Input,
        additionalWages: [
          {
            contributionMonth: "2026-12",
            amount: 1_000,
            additionalWageCeilingContext: {
              annualOrdinaryWagesSubjectToCpf: 60_000,
            },
          },
        ],
      }),
    );
    const duplicate = await POST(
      createRequest({
        ...v2Input,
        additionalWages: [
          {
            contributionMonth: "2026-12",
            amount: 500,
            additionalWageCeilingContext: {
              remainingAdditionalWageCeiling: 42_000,
            },
          },
          {
            contributionMonth: "2026-12",
            amount: 500,
            additionalWageCeilingContext: {
              remainingAdditionalWageCeiling: 41_500,
            },
          },
        ],
      }),
    );

    expect(incomplete.status).toBe(422);
    expect((await incomplete.json()).error).toContain(
      "must provide both annualOrdinaryWagesSubjectToCpf",
    );
    expect(duplicate.status).toBe(422);
    expect((await duplicate.json()).error).toContain(
      "more than one payment for 2026-12",
    );
  });

  it("returns 422 when an Additional Wage month is outside the projection", async () => {
    const response = await POST(
      createRequest({
        ...v2Input,
        additionalWages: [
          {
            contributionMonth: "2028-01",
            amount: 1_000,
            additionalWageCeilingContext: {
              annualOrdinaryWagesSubjectToCpf: 60_000,
              priorAdditionalWagesSubjectToCpf: 0,
            },
          },
        ],
      }),
    );

    expect(response.status).toBe(422);
    expect((await response.json()).error).toContain(
      "must fall within the projection range",
    );
  });

  it("preserves all opening-year interest, RA and tax-relief context", async () => {
    const openingContext = {
      initialYearToDateAccruedInterest: {
        oa: 10,
        sa: 0,
        ma: 20,
        ra: 30,
      },
      initialRaSavingsForLimits: 120_000,
      initialRaSavingsForContributionRouting: 100_000,
      initialCashTopUpTaxReliefUsedThisYear: 500,
    };
    const response = await POST(
      createRequest({
        ...v2Input,
        birthDate: "08/1966",
        initialBalances: { oa: 1_000, sa: 0, ma: 3_000, ra: 120_000 },
        endAge: 60,
        ...openingContext,
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.input).toMatchObject(openingContext);
    expect(data.yearlyBalances[0].raSavingsForLimits).toBeGreaterThan(0);
    expect(
      data.yearlyBalances[0].raSavingsForContributionRouting,
    ).toBeGreaterThan(0);
  });

  it("accepts a legacy zero-balance request only with explicit warnings", async () => {
    const response = await POST(
      createRequest({
        monthlyIncome: 5000,
        birthDate: "08/1996",
        endAge: 30,
        citizenship: "citizen",
      }),
    );
    const data = await response.json();
    const warningCodes = data.warnings.map(
      (warning: { code: string }) => warning.code,
    );

    expect(response.status).toBe(200);
    expect(warningCodes).toContain("start-month-defaulted");
    expect(warningCodes).toContain("initial-balances-defaulted");
    expect(warningCodes).toContain("legacy-projection-input");
  });

  it("lets birthDate take precedence over the deprecated startAge alias", async () => {
    const response = await POST(
      createRequest({
        ...v2Input,
        startAge: 60,
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.input.birthDate).toBe(v2Input.birthDate);
    expect(data.input.startAge).toBeUndefined();
    expect(data.yearlyBalances[0].age).toBe(30);
    expect(data.warnings).toContainEqual(
      expect.objectContaining({
        code: "legacy-projection-input",
        message: expect.stringContaining("ignored because birthDate"),
      }),
    );
  });

  it("keeps income, age and years for one compatibility cycle", async () => {
    const response = await POST(
      createRequest({ income: 5000, age: 30, years: 2 }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.deprecatedInput).toEqual({ income: 5000, age: 30, years: 2 });
    expect(data.projections.length).toBeGreaterThan(0);
    expect(data.warnings).toContainEqual(
      expect.objectContaining({ code: "legacy-projection-input" }),
    );
  });

  it("accepts oaToSaTransfer as a deprecated age-aware alias", async () => {
    const response = await POST(
      createRequest({
        ...v2Input,
        oaToSaTransfer: { amount: 200, timing: "now" },
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.warnings).toContainEqual(
      expect.objectContaining({ code: "legacy-transfer-field" }),
    );
  });

  it("preserves an SPR conversion month for anniversary transitions", async () => {
    const response = await POST(
      createRequest({
        ...v2Input,
        citizenship: "spr-year1",
        permanentResidentSince: "2026-03",
        endAge: 31,
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.input.permanentResidentSince).toBe("2026-03");
    expect(data.warnings).not.toContainEqual(
      expect.objectContaining({ code: "pr-anniversary-not-modelled" }),
    );
  });

  it("freezes post-2027 policies and marks affected rows assumed", async () => {
    const response = await POST(
      createRequest({
        ...v2Input,
        startMonth: "2028-01",
        birthDate: "08/1996",
        endAge: 32,
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(
      data.yearlyBalances.some(
        (row: { policy: { status: string } }) =>
          row.policy.status === "assumed",
      ),
    ).toBe(true);
    expect(data.warnings).toContainEqual(
      expect.objectContaining({ code: "future-policy-frozen" }),
    );
  });

  it.each([
    [
      {
        monthlyIncome: 5000,
        birthDate: "08/1996",
        citizenship: "citizen",
        startMonth: "2026-08",
      },
      "startMonth and initialBalances must be supplied together for the v2 request.",
    ],
    [
      { monthlyIncome: 5000, birthDate: "08/1996" },
      "citizenship must be citizen, spr-year1, spr-year2, or spr-year3-plus.",
    ],
    [
      { ...v2Input, initialBalances: { ...v2Input.initialBalances, ra: 1 } },
      "A Retirement Account balance cannot exist before age 55.",
    ],
    [
      {
        ...v2Input,
        voluntaryTopUp: { amount: 100, account: "OA", frequency: "yearly" },
      },
      "voluntaryTopUp.account must be retirement, MA, SA, or RA.",
    ],
    [
      { ...v2Input, retirementTransfer: { amount: 100, timing: "later" } },
      "retirementTransfer.timing must be now, monthly, or yearly.",
    ],
    [
      {
        ...v2Input,
        citizenship: "spr-year1",
        permanentResidentSince: "March 2026",
      },
      "permanentResidentSince must be in YYYY-MM format.",
    ],
    [
      {
        ...v2Input,
        citizenship: "spr-year1",
        permanentResidentSince: "2026-09",
      },
      "permanentResidentSince cannot be after startMonth.",
    ],
  ])("returns 422 for invalid semantic input", async (body, error) => {
    const response = await POST(createRequest(body));
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBe(error);
    expect(data.code).toBe("INVALID_INPUT");
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
