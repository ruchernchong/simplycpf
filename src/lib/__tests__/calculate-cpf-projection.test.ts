import { describe, expect, it } from "vitest";
import { CPF_LIFE_2026_REFERENCE } from "@/constants/cpf-life";
import { getCohortRetirementThresholds } from "@/constants/cpf-retirement-sums";
import {
  calculateCpfProjection,
  getCurrentSingaporeMonth,
} from "../calculate-cpf-projection";

function zeroBalances() {
  return { oa: 0, sa: 0, ma: 0, ra: 0 };
}

describe("calculateCpfProjection monthly ledger", () => {
  it("uses the Singapore calendar month at the UTC month boundary", () => {
    expect(getCurrentSingaporeMonth(new Date("2026-08-31T16:30:00Z"))).toBe(
      "2026-09",
    );
  });

  it("defaults omitted legacy balances to zero with an explicit warning", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1996",
      startMonth: "2026-12",
      endAge: 30,
      citizenship: "citizen",
    });

    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "initial-balances-defaulted" }),
    );
  });

  it("carries explicit starting balances into the ledger", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1996",
      startMonth: "2026-12",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: { oa: 10_000, sa: 20_000, ma: 30_000, ra: 0 },
    });
    const final = result.yearlyBalances[0].balances;

    expect(final.oa).toBeGreaterThan(10_000);
    expect(final.sa).toBeGreaterThan(20_000);
    expect(final.ma).toBeGreaterThan(30_000);
    expect(final.ra).toBe(0);
  });

  it("credits destination-account interest on opening MA overflow", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1996",
      startMonth: "2026-12",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: { oa: 0, sa: 0, ma: 80_000, ra: 0 },
    });

    expect(result.totalInterestEarned).toBe(316.66);
    expect(result.yearlyBalances[0].balances.sa).toBe(1_316.66);
    expect(result.yearlyBalances[0].balances.ma).toBe(79_000);
  });

  it("does not let an RA exist before age 55", () => {
    expect(() =>
      calculateCpfProjection({
        monthlyIncome: 0,
        birthDate: "01/1996",
        startMonth: "2026-12",
        endAge: 30,
        citizenship: "citizen",
        initialBalances: { oa: 0, sa: 0, ma: 0, ra: 1 },
      }),
    ).toThrow("cannot exist before age 55");
  });

  it("rejects an opening SA balance after the member's SA has closed", () => {
    expect(() =>
      calculateCpfProjection({
        monthlyIncome: 0,
        birthDate: "01/1966",
        startMonth: "2026-08",
        endAge: 60,
        citizenship: "citizen",
        initialBalances: { oa: 0, sa: 1, ma: 0, ra: 100_000 },
      }),
    ).toThrow("A Special Account balance cannot exist");
  });

  it("rejects a projection start before the member's birth month", () => {
    expect(() =>
      calculateCpfProjection({
        monthlyIncome: 0,
        birthDate: "01/2027",
        startMonth: "2026-12",
        endAge: 0,
        citizenship: "citizen",
        initialBalances: zeroBalances(),
      }),
    ).toThrow("cannot be before birthDate");
  });

  it("rejects a horizon after the latest CPF payout-start age", () => {
    expect(() =>
      calculateCpfProjection({
        monthlyIncome: 0,
        birthDate: "01/1996",
        startMonth: "2026-12",
        endAge: 71,
        citizenship: "citizen",
        initialBalances: zeroBalances(),
      }),
    ).toThrow("cannot exceed 70");
  });

  it("returns an age-70 opening checkpoint without processing the payout month", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "02/1957",
      startMonth: "2026-12",
      endAge: 70,
      citizenship: "citizen",
      initialBalances: { oa: 0, sa: 0, ma: 0, ra: 100_000 },
      initialRaSavingsForLimits: 100_000,
      initialRaSavingsForContributionRouting: 100_000,
    });

    expect(result.yearlyBalances.at(-1)?.month).toBe("2027-01");
    expect(result.milestones.age70).toEqual(
      result.yearlyBalances.at(-1)?.balances,
    );
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "cpf-life-estimate-removed" }),
    );
  });

  it("keeps the age-55 rate through the birthday month", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 8_000,
      birthDate: "12/1971",
      startMonth: "2026-12",
      endAge: 55,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
    });

    expect(result.yearlyBalances[0].month).toBe("2026-12");
    expect(result.yearlyBalances[0].contributions.total).toBe(2_960);
  });

  it("moves to the next contribution band in the month after the birthday", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 8_000,
      birthDate: "12/1971",
      startMonth: "2027-01",
      endAge: 55,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
    });

    expect(result.yearlyBalances).toHaveLength(1);
    expect(result.yearlyBalances[0].contributions.total).toBe(2_840 * 11);
  });

  it("does not lose any post-55 contribution share", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 8_000,
      birthDate: "01/1966",
      startMonth: "2026-12",
      endAge: 60,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
    });
    const row = result.yearlyBalances[0];
    const allocated =
      row.distribution.oa +
      row.distribution.sa +
      row.distribution.ma +
      row.distribution.ra;

    expect(allocated).toBeCloseTo(row.contributions.total, 2);
    expect(row.distribution.ra).toBeGreaterThan(0);
    expect(row.distribution.sa).toBe(0);
  });

  it("applies a dated Additional Wage once with annual ceiling context", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      additionalWages: [
        {
          contributionMonth: "2026-12",
          amount: 10_000,
          additionalWageCeilingContext: {
            annualOrdinaryWagesSubjectToCpf: 98_000,
            priorAdditionalWagesSubjectToCpf: 0,
          },
        },
      ],
      birthDate: "01/1996",
      startMonth: "2026-01",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
      initialYearToDateAccruedInterest: zeroBalances(),
    });

    expect(result.yearlyBalances[0].contributions.total).toBe(1_480);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "additional-wages-capped" }),
    );
    expect(result.assumptions.additionalWages).toBe(
      "explicit-dated-payments-only",
    );
  });

  it("accepts an explicit remaining Additional Wage ceiling", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      additionalWages: [
        {
          contributionMonth: "2026-12",
          amount: 10_000,
          additionalWageCeilingContext: {
            remainingAdditionalWageCeiling: 4_000,
          },
        },
      ],
      birthDate: "01/1996",
      startMonth: "2026-01",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
      initialYearToDateAccruedInterest: zeroBalances(),
    });

    expect(result.yearlyBalances[0].contributions.total).toBe(1_480);
  });

  it("rejects duplicate and out-of-range Additional Wage months", () => {
    const payment = {
      contributionMonth: "2026-12",
      amount: 1_000,
      additionalWageCeilingContext: {
        remainingAdditionalWageCeiling: 102_000,
      },
    };
    const common = {
      monthlyIncome: 0,
      birthDate: "01/1996",
      startMonth: "2026-01",
      endAge: 30,
      citizenship: "citizen" as const,
      initialBalances: zeroBalances(),
      initialYearToDateAccruedInterest: zeroBalances(),
    };

    expect(() =>
      calculateCpfProjection({
        ...common,
        additionalWages: [payment, payment],
      }),
    ).toThrow(/more than one payment for 2026-12/);
    expect(() =>
      calculateCpfProjection({
        ...common,
        additionalWages: [{ ...payment, contributionMonth: "2027-01" }],
      }),
    ).toThrow(/must fall within the projection range/);
  });

  it("marks a post-2027 Additional Wage schedule as assumed", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      additionalWages: [
        {
          contributionMonth: "2028-01",
          amount: 1_000,
          additionalWageCeilingContext: {
            remainingAdditionalWageCeiling: 102_000,
          },
        },
      ],
      birthDate: "01/1996",
      startMonth: "2028-01",
      endAge: 32,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
    });

    expect(result.yearlyBalances[0].contributions.total).toBe(370);
    expect(result.yearlyBalances[0].policy.contribution.status).toBe("assumed");
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "future-policy-frozen" }),
    );
  });

  it("moves graduated SPR rates in the month after each anniversary", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5_000,
      birthDate: "02/1996",
      startMonth: "2026-01",
      endAge: 30,
      citizenship: "spr-year1",
      permanentResidentSince: "2025-01",
      initialBalances: zeroBalances(),
    });
    const row2026 = result.yearlyBalances.find(({ year }) => year === 2026);

    expect(row2026?.contributions.total).toBe(450 + 1_200 * 11);
    expect(result.warnings).not.toContainEqual(
      expect.objectContaining({ code: "pr-anniversary-not-modelled" }),
    );
  });

  it("warns when a legacy graduated SPR request omits its conversion month", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5_000,
      birthDate: "02/1996",
      startMonth: "2026-01",
      endAge: 30,
      citizenship: "spr-year1",
      initialBalances: zeroBalances(),
    });
    const row2026 = result.yearlyBalances.find(({ year }) => year === 2026);

    expect(row2026?.contributions.total).toBe(450 * 12);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "pr-anniversary-not-modelled" }),
    );
  });

  it("aggregates both official 2023 ceiling schedules in the annual provenance", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 6_300,
      birthDate: "02/1996",
      startMonth: "2023-01",
      endAge: 27,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
      initialYearToDateAccruedInterest: zeroBalances(),
    });
    const row2023 = result.yearlyBalances.find(({ year }) => year === 2023);

    expect(row2023?.policy.wageCeiling.version).toContain("cpf-2023-jan-aug");
    expect(row2023?.policy.wageCeiling.version).toContain("cpf-2023-sep-dec");
    expect(row2023?.policy.wageCeiling.sources.length).toBeGreaterThan(1);
  });

  it("closes SA and routes SA then OA into RA at age 55", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "12/1971",
      startMonth: "2026-12",
      endAge: 55,
      citizenship: "citizen",
      initialBalances: { oa: 70_400, sa: 150_000, ma: 0, ra: 0 },
    });

    expect(result.milestones.age55).toBeDefined();
    expect(result.milestones.age55?.sa).toBe(0);
    expect(result.milestones.age55?.ra).toBeGreaterThan(220_400);
    expect(result.milestones.age55?.oa).toBe(0);
  });

  it("keeps both official retirement-routing contexts available", () => {
    const common = {
      monthlyIncome: 0,
      birthDate: "12/1971",
      startMonth: "2026-11",
      endAge: 55,
      citizenship: "citizen" as const,
      initialBalances: { oa: 100_000, sa: 150_000, ma: 0, ra: 0 },
    };
    const full = calculateCpfProjection({
      ...common,
      retirementRouting: "full-retirement-sum",
    });
    const property = calculateCpfProjection({
      ...common,
      retirementRouting: "basic-retirement-sum-with-property",
    });

    expect(full.yearlyBalances[0].balances.ra).toBeGreaterThan(
      property.yearlyBalances[0].balances.ra,
    );
    expect(property.yearlyBalances[0].propertyPledgeWithdrawal).toBe(110_200);
    expect(property.yearlyBalances[0].raSavingsForLimits).toBe(220_400);
    expect(property.yearlyBalances[0].raSavingsForContributionRouting).toBe(
      110_200,
    );
    expect(
      property.yearlyBalances[0].balances.oa +
        property.yearlyBalances[0].balances.ra,
    ).toBeLessThan(
      full.yearlyBalances[0].balances.oa + full.yearlyBalances[0].balances.ra,
    );
  });

  it("treats an eligible property withdrawal as having set aside the FRS", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 8_000,
      birthDate: "01/1970",
      startMonth: "2026-12",
      endAge: 56,
      citizenship: "citizen",
      initialBalances: { oa: 0, sa: 0, ma: 0, ra: 110_200 },
      retirementRouting: "basic-retirement-sum-with-property",
    });

    expect(result.yearlyBalances[0].distribution.ra).toBeGreaterThan(0);
    expect(result.yearlyBalances[0].raSavingsForLimits).toBeGreaterThan(
      result.yearlyBalances[0].raSavingsForContributionRouting,
    );
    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        code: "retirement-account-context-defaulted",
      }),
    );
  });

  it("uses RA savings excluding interest for the post-55 FRS test", () => {
    const cohort = getCohortRetirementThresholds("2021-01");
    const result = calculateCpfProjection({
      monthlyIncome: 8_000,
      birthDate: "01/1966",
      startMonth: "2026-12",
      endAge: 60,
      citizenship: "citizen",
      initialBalances: { oa: 0, sa: 0, ma: 0, ra: cohort.frs + 5_000 },
      initialRaSavingsForLimits: cohort.frs - 1_000,
      initialRaSavingsForContributionRouting: cohort.frs - 1_000,
    });

    expect(result.yearlyBalances[0].distribution.ra).toBeGreaterThan(0);
    expect(result.yearlyBalances[0].raSavingsForLimits).toBeGreaterThan(
      cohort.frs - 1_000,
    );
  });

  it("treats post-55 starting balances as an actual statement snapshot", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1966",
      startMonth: "2026-12",
      endAge: 60,
      citizenship: "citizen",
      initialBalances: { oa: 100_000, sa: 0, ma: 0, ra: 100_000 },
    });

    expect(result.yearlyBalances[0].distribution).toEqual({
      oa: 0,
      sa: 0,
      ma: 0,
      ra: 0,
    });
    expect(result.yearlyBalances[0].balances.oa).toBeGreaterThan(100_000);
  });

  it("uses RA, OA, SA, MA priority for senior extra interest", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1966",
      startMonth: "2026-12",
      endAge: 60,
      citizenship: "citizen",
      initialBalances: { oa: 20_000, sa: 0, ma: 10_000, ra: 30_000 },
      retirementRouting: "basic-retirement-sum-with-property",
    });
    const row = result.yearlyBalances[0];

    expect(row.interestEarned.extraInterest).toBe(75);
    expect(row.balances.ra).toBeGreaterThan(30_000 + 100);
  });

  it("does not pay interest on a contribution received in the same month", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 8_000,
      birthDate: "01/1996",
      startMonth: "2026-12",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
    });

    expect(result.yearlyBalances[0].interestEarned).toEqual({
      oa: 0,
      sa: 0,
      ma: 0,
      ra: 0,
      extraInterest: 0,
    });
  });

  it("computes monthly interest and credits it annually", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "02/1996",
      startMonth: "2026-01",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: { oa: 10_000, sa: 0, ma: 0, ra: 0 },
    });
    const row2026 = result.yearlyBalances.find(({ year }) => year === 2026);

    expect(row2026?.interestEarned.oa).toBe(249.96);
    expect(row2026?.interestEarned.extraInterest).toBe(99.96);
    expect(row2026?.balances.oa).toBe(10_249.96);
    expect(row2026?.balances.sa).toBe(99.96);
  });

  it("uses the exact published quarterly SMRA rate", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "12/1996",
      startMonth: "2024-11",
      endAge: 27,
      citizenship: "citizen",
      initialBalances: { oa: 0, sa: 10_000, ma: 0, ra: 0 },
    });
    const row = result.yearlyBalances[0];

    expect(row.interestEarned.sa).toBe(34.5);
    expect(row.policy.interest.status).toBe("official");
    expect(row.policy.interest.version).toContain("2024 Q4");
  });

  it("uses floor presets only as an assumption after the latest declaration", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "11/1996",
      startMonth: "2026-10",
      endAge: 29,
      citizenship: "citizen",
      initialBalances: { oa: 0, sa: 10_000, ma: 0, ra: 0 },
    });
    const row = result.yearlyBalances[0];

    expect(row.interestEarned.sa).toBe(33.33);
    expect(row.policy.interest.status).toBe("assumed");
    expect(row.policy.status).toBe("assumed");
  });

  it("aggregates every quarterly interest source used by an annual row", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "02/1996",
      startMonth: "2024-01",
      endAge: 28,
      citizenship: "citizen",
      initialBalances: { oa: 0, sa: 10_000, ma: 0, ra: 0 },
      initialYearToDateAccruedInterest: zeroBalances(),
    });
    const row2024 = result.yearlyBalances.find(({ year }) => year === 2024);

    expect(row2024?.policy.interest.version).toContain("2024 Q1");
    expect(row2024?.policy.interest.version).toContain("2024 Q4");
    expect(row2024?.policy.interest.sources).toHaveLength(4);
  });

  it("credits supplied pre-start accrued interest without reporting it as projected earnings", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1996",
      startMonth: "2026-12",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: { oa: 10_000, sa: 0, ma: 0, ra: 0 },
      initialYearToDateAccruedInterest: {
        oa: 100,
        sa: 0,
        ma: 0,
        ra: 0,
      },
    });
    const row = result.yearlyBalances[0];

    expect(row.interestEarned.oa).toBe(20.83);
    expect(row.balances.oa).toBe(10_120.83);
    expect(row.uncreditedInterest).toBeUndefined();
  });

  it("warns when post-January accrued-interest context is omitted even with zero balances", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1996",
      startMonth: "2026-12",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
    });

    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "year-to-date-interest-defaulted" }),
    );
  });

  it("exposes uncredited interest when the final row ends before December", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "12/1996",
      startMonth: "2026-11",
      endAge: 29,
      citizenship: "citizen",
      initialBalances: { oa: 12_000, sa: 0, ma: 0, ra: 0 },
      initialYearToDateAccruedInterest: {
        oa: 100,
        sa: 0,
        ma: 0,
        ra: 0,
      },
    });

    expect(result.yearlyBalances[0].uncreditedInterest).toMatchObject({
      oa: 125,
      sa: 10,
      ma: 0,
      ra: 0,
    });
  });

  it("earns destination-account interest in the month existing SA is closed", () => {
    const cohort = getCohortRetirementThresholds("2020-02");
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "02/1965",
      startMonth: "2025-01",
      endAge: 59,
      citizenship: "citizen",
      initialBalances: { oa: 0, sa: 120_000, ma: 0, ra: 100_000 },
    });
    const row = result.yearlyBalances[0];
    const routedToRa = cohort.frs - 100_000;

    expect(row.interestEarned.ra).toBeCloseTo(
      ((100_000 + routedToRa) * 0.04) / 12,
      2,
    );
    expect(row.interestEarned.oa).toBeCloseTo(
      ((120_000 - routedToRa) * 0.025) / 12,
      2,
    );
  });

  it("earns destination-account interest for an existing OA transfer", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "12/1996",
      startMonth: "2026-11",
      endAge: 29,
      citizenship: "citizen",
      initialBalances: { oa: 12_000, sa: 0, ma: 0, ra: 0 },
      retirementTransfer: { amount: 5_000, timing: "now" },
    });
    const row = result.yearlyBalances[0];

    expect(row.interestEarned.oa).toBeCloseTo((7_000 * 0.025) / 12, 2);
    expect(row.interestEarned.sa).toBeCloseTo((5_000 * 0.04) / 12, 2);
  });

  it("counts an existing OA-to-RA transfer before routing that month's contribution", () => {
    const cohort = getCohortRetirementThresholds("2021-01");
    const result = calculateCpfProjection({
      monthlyIncome: 8_000,
      birthDate: "01/1966",
      startMonth: "2026-12",
      endAge: 60,
      citizenship: "citizen",
      initialBalances: {
        oa: 500,
        sa: 0,
        ma: 0,
        ra: cohort.frs - 500,
      },
      initialRaSavingsForLimits: cohort.frs - 500,
      initialRaSavingsForContributionRouting: cohort.frs - 500,
      retirementTransfer: { amount: 500, timing: "now" },
    });
    const row = result.yearlyBalances[0];

    expect(row.retirementTransfer).toBe(500);
    expect(row.distribution.ra).toBe(0);
    expect(row.raSavingsForContributionRouting).toBe(cohort.frs);
  });

  it("moves a fresh monthly OA contribution by month-end without current-month interest", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 8_000,
      birthDate: "12/1996",
      startMonth: "2026-11",
      endAge: 29,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
      retirementTransfer: { amount: 1_000, timing: "monthly" },
    });
    const row = result.yearlyBalances[0];

    expect(row.retirementTransfer).toBe(1_000);
    expect(row.balances.oa).toBeCloseTo(row.distribution.oa - 1_000, 2);
    expect(row.balances.sa).toBeCloseTo(row.distribution.sa + 1_000, 2);
    expect(row.interestEarned).toEqual({
      oa: 0,
      sa: 0,
      ma: 0,
      ra: 0,
      extraInterest: 0,
    });
  });

  it("marks a historical retirement-transfer capacity rule as a backcast", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1996",
      startMonth: "2025-12",
      endAge: 29,
      citizenship: "citizen",
      initialBalances: { oa: 10_000, sa: 0, ma: 0, ra: 0 },
      retirementTransfer: { amount: 1_000, timing: "now" },
    });
    const row = result.yearlyBalances[0];

    expect(row.policy.retirementTopUps.status).toBe("assumed");
    expect(row.policy.status).toBe("assumed");
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "future-policy-frozen" }),
    );
  });

  it("routes MA overflow to retirement savings and then OA", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 8_000,
      birthDate: "01/1996",
      startMonth: "2026-12",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: { oa: 0, sa: 220_000, ma: 79_000, ra: 0 },
    });
    const row = result.yearlyBalances[0];

    expect(row.balances.ma).toBe(79_000);
    expect(row.balances.sa).toBeGreaterThan(220_400);
    expect(row.balances.oa).toBeGreaterThan(0);
    expect(
      row.distribution.oa +
        row.distribution.sa +
        row.distribution.ma +
        row.distribution.ra,
    ).toBeCloseTo(row.contributions.total, 2);
  });

  it("routes annual MA interest above BHS without losing the credited interest", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "02/1996",
      startMonth: "2026-01",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: { oa: 0, sa: 0, ma: 78_900, ra: 0 },
      initialYearToDateAccruedInterest: zeroBalances(),
    });
    const row2026 = result.yearlyBalances.find(({ year }) => year === 2026);

    expect(row2026?.balances.ma).toBe(79_000);
    expect(row2026?.balances.sa).toBeGreaterThan(3_000);
    expect(
      (row2026?.balances.oa ?? 0) +
        (row2026?.balances.sa ?? 0) +
        (row2026?.balances.ma ?? 0),
    ).toBeCloseTo(
      78_900 +
        (row2026?.interestEarned.ma ?? 0) +
        (row2026?.interestEarned.extraInterest ?? 0),
      2,
    );
  });

  it("counts active CPFIS-SA investments before routing MA overflow to SA", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "12/1996",
      startMonth: "2026-11",
      endAge: 29,
      citizenship: "citizen",
      initialBalances: { oa: 0, sa: 200_000, ma: 80_000, ra: 0 },
      netSaSavingsWithdrawnForInvestments: 20_000,
    });
    const row = result.yearlyBalances[0];

    expect(row.balances).toMatchObject({
      oa: 600,
      sa: 200_400,
      ma: 79_000,
      ra: 0,
    });
  });

  it("recognises a property pledge when routing post-55 MA overflow", () => {
    const cohort = getCohortRetirementThresholds("2021-12");
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "12/1966",
      startMonth: "2026-11",
      endAge: 59,
      citizenship: "citizen",
      initialBalances: { oa: 0, sa: 0, ma: 80_000, ra: cohort.brs },
      retirementRouting: "basic-retirement-sum-with-property",
    });
    const row = result.yearlyBalances[0];

    expect(row.balances).toMatchObject({
      oa: 1_000,
      sa: 0,
      ma: 79_000,
      ra: cohort.brs,
    });
  });

  it("applies monthly top-ups every month and tracks relief separately", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "02/1996",
      startMonth: "2026-01",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
      voluntaryTopUp: {
        amount: 1_000,
        account: "retirement",
        frequency: "monthly",
      },
    });
    const row2026 = result.yearlyBalances.find(({ year }) => year === 2026);
    const row2027 = result.yearlyBalances.find(({ year }) => year === 2027);

    expect(row2026?.voluntaryTopUp).toBe(12_000);
    expect(row2026?.topUpPotentialTaxRelief).toBe(8_000);
    expect(row2027?.voluntaryTopUp).toBe(1_000);
    expect(row2027?.topUpPotentialTaxRelief).toBe(1_000);
  });

  it("repeats yearly top-ups on the projection-start anniversary", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "02/1996",
      startMonth: "2026-12",
      endAge: 31,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
      voluntaryTopUp: {
        amount: 1_000,
        account: "retirement",
        frequency: "yearly",
      },
    });

    expect(
      result.yearlyBalances.find(({ year }) => year === 2026)?.voluntaryTopUp,
    ).toBe(1_000);
    expect(
      result.yearlyBalances.find(({ year }) => year === 2027)?.voluntaryTopUp,
    ).toBe(1_000);
    expect(
      result.yearlyBalances.find(({ year }) => year === 2028)?.voluntaryTopUp,
    ).toBeUndefined();
  });

  it("does not cap the actual retirement top-up at the tax-relief cap", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1996",
      startMonth: "2026-12",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
      voluntaryTopUp: {
        amount: 12_000,
        account: "retirement",
        frequency: "yearly",
      },
    });
    const row = result.yearlyBalances[0];

    expect(row.voluntaryTopUp).toBe(12_000);
    expect(row.topUpPotentialTaxRelief).toBe(8_000);
  });

  it("uses tax-relief cap already consumed in the projection start year", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1996",
      startMonth: "2026-12",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
      initialCashTopUpTaxReliefUsedThisYear: 7_000,
      voluntaryTopUp: {
        amount: 2_000,
        account: "retirement",
        frequency: "yearly",
      },
    });

    expect(result.yearlyBalances[0].voluntaryTopUp).toBe(2_000);
    expect(result.yearlyBalances[0].topUpPotentialTaxRelief).toBe(1_000);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        code: "tax-relief-eligibility-context-missing",
      }),
    );
  });

  it("rejects nonzero year-to-date relief usage for a January opening", () => {
    expect(() =>
      calculateCpfProjection({
        monthlyIncome: 0,
        birthDate: "02/1996",
        startMonth: "2026-01",
        endAge: 30,
        citizenship: "citizen",
        initialBalances: zeroBalances(),
        initialYearToDateAccruedInterest: zeroBalances(),
        initialCashTopUpTaxReliefUsedThisYear: 1,
      }),
    ).toThrow("must be zero for a January startMonth");
  });

  it("reports retirement top-up capacity that was not applied", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1996",
      startMonth: "2026-12",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: { oa: 0, sa: 220_000, ma: 0, ra: 0 },
      voluntaryTopUp: {
        amount: 1_000,
        account: "retirement",
        frequency: "yearly",
      },
    });

    expect(result.yearlyBalances[0].voluntaryTopUp).toBe(400);
    expect(result.yearlyBalances[0].unappliedVoluntaryTopUp).toBe(600);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "retirement-top-up-capped" }),
    );
  });

  it("counts net SA investment withdrawals towards the under-55 FRS limit", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1996",
      startMonth: "2026-12",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: { oa: 0, sa: 200_000, ma: 0, ra: 0 },
      netSaSavingsWithdrawnForInvestments: 20_000,
      voluntaryTopUp: {
        amount: 1_000,
        account: "retirement",
        frequency: "yearly",
      },
    });

    expect(result.yearlyBalances[0].voluntaryTopUp).toBe(400);
    expect(result.warnings).not.toContainEqual(
      expect.objectContaining({
        code: "retirement-top-up-capacity-context-missing",
      }),
    );
  });

  it("accepts a legacy SA top-up destination with an explicit warning", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1996",
      startMonth: "2026-12",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
      voluntaryTopUp: { amount: 1_000, account: "SA", frequency: "yearly" },
    });

    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "legacy-top-up-account" }),
    );
    expect(result.yearlyBalances[0].balances.sa).toBe(1_000);
  });

  it("does not invent MediSave tax relief without annual CPF context", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1996",
      startMonth: "2026-12",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
      voluntaryTopUp: { amount: 1_000, account: "MA", frequency: "yearly" },
    });

    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "ma-tax-relief-not-estimated" }),
    );
    expect(result.yearlyBalances[0].voluntaryTopUp).toBe(1_000);
    expect(result.yearlyBalances[0].topUpPotentialTaxRelief).toBeUndefined();
  });

  it("rejects a MediSave top-up in full when it exceeds remaining BHS capacity", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1996",
      startMonth: "2026-12",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: { oa: 0, sa: 0, ma: 78_500, ra: 0 },
      voluntaryTopUp: { amount: 1_000, account: "MA", frequency: "yearly" },
    });

    expect(result.yearlyBalances[0].voluntaryTopUp).toBeUndefined();
    expect(result.yearlyBalances[0].unappliedVoluntaryTopUp).toBe(1_000);
    expect(result.yearlyBalances[0].balances.ma).toBeGreaterThan(78_500);
    expect(result.yearlyBalances[0].balances.ma).toBeLessThan(79_000);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "medisave-top-up-rejected" }),
    );
  });

  it("marks the current MediSave top-up rejection rule as a historical backcast", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1996",
      startMonth: "2025-12",
      endAge: 29,
      citizenship: "citizen",
      initialBalances: { oa: 0, sa: 0, ma: 71_000, ra: 0 },
      voluntaryTopUp: { amount: 1_000, account: "MA", frequency: "yearly" },
    });

    expect(result.yearlyBalances[0].policy.bhs.status).toBe("assumed");
    expect(result.yearlyBalances[0].policy.bhs.notes?.join(" ")).toContain(
      "backcast",
    );
    expect(result.yearlyBalances[0].policy.status).toBe("assumed");
  });

  it("routes retirement transfers to SA below 55 and RA from 55", () => {
    const below55 = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1996",
      startMonth: "2026-12",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: { oa: 10_000, sa: 0, ma: 0, ra: 0 },
      retirementTransfer: { amount: 5_000, timing: "now" },
    });
    const from55 = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1966",
      startMonth: "2026-12",
      endAge: 60,
      citizenship: "citizen",
      initialBalances: { oa: 10_000, sa: 0, ma: 0, ra: 0 },
      retirementTransfer: { amount: 5_000, timing: "now" },
    });

    expect(below55.yearlyBalances[0].balances.sa).toBeGreaterThan(5_000);
    expect(from55.yearlyBalances[0].balances.ra).toBeGreaterThan(5_000);
  });

  it("freezes unpublished future policy without extrapolating it", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 8_000,
      birthDate: "01/1996",
      startMonth: "2028-12",
      endAge: 32,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
    });
    const row = result.yearlyBalances[0];

    expect(row.policy.status).toBe("assumed");
    expect(row.policy.contribution.status).toBe("assumed");
    expect(row.policy.bhs.status).toBe("assumed");
    expect(row.retirementSums).toEqual({
      brs: 114_100,
      frs: 228_200,
      ers: 456_400,
    });
  });

  it("returns exact CPF Board reference rows and no personalised estimate", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/1996",
      startMonth: "2026-12",
      endAge: 30,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
    });

    expect(result.cpfLifeEstimate).toBeNull();
    expect(result.cpfLifeReference).toEqual(CPF_LIFE_2026_REFERENCE);
    expect(result.cpfLifeReference.rows[1]).toMatchObject({
      raAt55: 110_200,
      raAt65: 170_100,
      monthlyPayoutAt65: 950,
      monthlyPayoutAt70: 1_280,
    });
    expect(result.cpfLifeReference.rows[5]).toMatchObject({
      raAt55: 440_800,
      raAt65: 650_100,
      monthlyPayoutAt65: 3_440,
      monthlyPayoutAt70: 4_580,
    });
  });
});
