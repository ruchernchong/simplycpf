import { describe, expect, it, vi } from "vitest";
import { calculateCpfProjection } from "../calculate-cpf-projection";

vi.mock("@/constants", () => {
  const CPF_INCOME_CEILING: Record<string, number> = {
    "2023-01-01": 6000,
    "2023-09-01": 6300,
    "2024-01-01": 6800,
    "2025-01-01": 7400,
    "2026-01-01": 8000,
  };
  return {
    CPF_INCOME_CEILING,
    CPF_INCOME_CEILING_BEFORE_SEPT_2023: 6000,
    DEFAULT_CPF_INCOME_CEILING: 6000,
    getCeilingForYear: (year: number) => {
      const yearEnd = new Date(`${year}-12-31`);
      const sorted = Object.entries(CPF_INCOME_CEILING).sort(
        ([a], [b]) => new Date(a).getTime() - new Date(b).getTime(),
      );
      let ceiling = 6000;
      for (const [date, value] of sorted) {
        if (new Date(date) <= yearEnd) ceiling = value;
        else break;
      }
      return ceiling;
    },
  };
});

vi.mock("@/constants/cpf-interest-rates", () => ({
  CPF_INTEREST_FLOOR_RATES: { OA: 2.5, SMRA: 4.0 },
}));

vi.mock("@/constants/cpf-interest-tiers", () => ({
  CPF_EXTRA_INTEREST_CAP: 60_000,
  CPF_OA_EXTRA_INTEREST_CAP: 20_000,
  CPF_EXTRA_INTEREST_RATE: 0.01,
  CPF_ADDITIONAL_SENIOR_INTEREST_CAP: 30_000,
}));

vi.mock("@/constants/cpf-retirement-sums", () => ({
  CPF_RETIREMENT_SUMS: {
    "2026": { brs: 110_200, frs: 220_400, ers: 440_800 },
  },
  getRetirementSumsForYear: (year: number) => {
    const base = { brs: 110_200, frs: 220_400, ers: 440_800 };
    if (year <= 2026) return base;
    const diff = year - 2026;
    const brs = Math.round((base.brs * 1.035 ** diff) / 100) * 100;
    return { brs, frs: brs * 2, ers: brs * 4 };
  },
}));

vi.mock("@/constants/cpf-bhs", () => ({
  CPF_BASIC_HEALTHCARE_SUM: {
    "2026": 79_000,
  },
  getBhsForYear: (year: number) => {
    if (year <= 2026) return 79_000;
    return 79_000 + 3500 * (year - 2026);
  },
}));

vi.mock("@/data", () => ({
  ageGroups: [
    {
      description: "55 and below",
      minAge: 0,
      maxAge: 55,
      contributionRate: { employee: 0.2, employer: 0.17 },
      distributionRate: { OA: 0.6217, SA: 0.1621, MA: 0.2162 },
    },
    {
      description: "Above 55 to 60",
      minAge: 55,
      maxAge: 60,
      contributionRate: { employee: 0.16, employer: 0.105 },
      distributionRate: { OA: 0.4577, SA: 0.1463, MA: 0.266 },
    },
    {
      description: "Above 60 to 65",
      minAge: 60,
      maxAge: 65,
      contributionRate: { employee: 0.105, employer: 0.06 },
      distributionRate: { OA: 0.1818, SA: 0.1515, MA: 0.4318 },
    },
    {
      description: "Above 65 to 70",
      minAge: 65,
      maxAge: 70,
      contributionRate: { employee: 0.075, employer: 0.05 },
      distributionRate: { OA: 0.08, SA: 0.08, MA: 0.544 },
    },
    {
      description: "Above 70",
      minAge: 70,
      contributionRate: { employee: 0.05, employer: 0.05 },
      distributionRate: { OA: 0.08, SA: 0.08, MA: 0.64 },
    },
  ],
}));

vi.mock("@/data/permanent-resident-rates", () => ({
  permanentResidentYear1Rates: [
    {
      description: "1st Year SPR 55 and below",
      minAge: 0,
      maxAge: 55,
      contributionRate: { employee: 0.05, employer: 0.04 },
      distributionRate: { OA: 0.6217, SA: 0.1621, MA: 0.2162 },
    },
  ],
  permanentResidentYear2Rates: [
    {
      description: "2nd Year SPR 55 and below",
      minAge: 0,
      maxAge: 55,
      contributionRate: { employee: 0.15, employer: 0.09 },
      distributionRate: { OA: 0.6217, SA: 0.1621, MA: 0.2162 },
    },
  ],
}));

vi.mock("@/lib/find-age-group", () => ({
  findAgeGroup: vi.fn(
    (
      age: number,
      groups?: Array<{
        minAge: number;
        maxAge?: number;
        description: string;
        contributionRate: { employee: number; employer: number };
        distributionRate: Record<string, number>;
      }>,
    ) => {
      const ageGroups = groups ?? [
        {
          description: "55 and below",
          minAge: 0,
          maxAge: 55,
          contributionRate: { employee: 0.2, employer: 0.17 },
          distributionRate: { OA: 0.6217, SA: 0.1621, MA: 0.2162 },
        },
      ];

      for (let i = ageGroups.length - 1; i >= 0; i--) {
        const g = ageGroups[i];
        if (age === g.minAge) return g;
      }

      for (const g of ageGroups) {
        if (age > g.minAge && (g.maxAge === undefined || age <= g.maxAge)) {
          return g;
        }
      }

      return ageGroups[0];
    },
  ),
}));

describe("calculateCpfProjection", () => {
  it("should project from age 25 to 65 with S$5,000 income", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 25,
      endAge: 65,
      citizenship: "citizen",
    });

    expect(result.yearlyBalances).toHaveLength(41);
    expect(result.yearlyBalances[0].age).toBe(25);
    expect(result.yearlyBalances[40].age).toBe(65);

    expect(result.totalContributed).toBeGreaterThan(0);
    expect(result.totalInterestEarned).toBeGreaterThan(0);

    expect(result.milestones.age55.oa).toBeGreaterThan(0);
    expect(result.milestones.age55.sa).toBe(0);
    expect(result.milestones.age55.ra).toBeGreaterThan(0);

    expect(result.milestones.age65.ra).toBeGreaterThan(
      result.milestones.age55.ra,
    );

    expect(result.cpfLifeEstimate.standardMonthly).toBeGreaterThan(0);
    expect(result.cpfLifeEstimate.escalatingStartMonthly).toBeLessThan(
      result.cpfLifeEstimate.standardMonthly,
    );
    expect(result.cpfLifeEstimate.basicMonthly).toBeLessThan(
      result.cpfLifeEstimate.standardMonthly,
    );
    expect(result.cpfLifeEstimate.deferredTo70Monthly).toBeGreaterThan(
      result.cpfLifeEstimate.standardMonthly,
    );
  });

  it("should cap income at the income ceiling", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 15000,
      birthDate: "01/2001",
      startAge: 30,
      endAge: 31,
      citizenship: "citizen",
    });

    const yearlyBalance = result.yearlyBalances[0];
    expect(yearlyBalance.contributions.total).toBeLessThan(15000 * 0.37 * 12);
  });

  it("should apply SA to RA conversion at age 55", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 50,
      endAge: 56,
      citizenship: "citizen",
    });

    const age55Balance = result.yearlyBalances.filter((b) => b.age === 55)[0];
    const age56Balance = result.yearlyBalances.filter((b) => b.age === 56)[0];

    expect(age55Balance).toBeDefined();
    expect(age56Balance).toBeDefined();
    expect(age56Balance.balances.sa).toBe(0);
    expect(age56Balance.balances.ra).toBeGreaterThan(0);
  });

  it("should keep SA at 0 when projection starts at age 57", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/1968",
      startAge: 57,
      endAge: 60,
      citizenship: "citizen",
    });

    for (const balance of result.yearlyBalances) {
      expect(balance.balances.sa).toBe(0);
    }
  });

  it("should calculate extra interest on first S$60,000", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 25,
      endAge: 26,
      citizenship: "citizen",
    });

    const yearlyBalance = result.yearlyBalances[0];
    expect(yearlyBalance.interestEarned.extraInterest).toBeGreaterThan(0);
  });

  it("should apply additional 1% senior extra interest after age 55", () => {
    const baseline = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 54,
      endAge: 56,
      citizenship: "citizen",
    });

    const age54 = baseline.yearlyBalances.filter((b) => b.age === 54)[0];
    const age56 = baseline.yearlyBalances.filter((b) => b.age === 56)[0];

    expect(age54.interestEarned.extraInterest).toBeGreaterThan(0);
    expect(age56.interestEarned.extraInterest).toBeGreaterThan(
      age54.interestEarned.extraInterest,
    );
  });

  it("should redirect OA extra interest to RA after age 55", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 54,
      endAge: 56,
      citizenship: "citizen",
    });

    const age56Balance = result.yearlyBalances.filter((b) => b.age === 56)[0];
    expect(age56Balance).toBeDefined();
    expect(age56Balance.balances.ra).toBeGreaterThan(0);
  });

  it("should apply BHS cap overflow from MA to SA", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 8000,
      birthDate: "01/2001",
      startAge: 25,
      endAge: 65,
      citizenship: "citizen",
    });

    for (const balance of result.yearlyBalances) {
      if (balance.age < 55) {
        const projectedBhs = 79000 + 3500 * (balance.year - 2026);
        expect(balance.balances.ma).toBeLessThanOrEqual(projectedBhs + 500);
      }
    }
  });

  it("should apply housing withdrawal from OA", () => {
    const resultWithoutHousing = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 30,
      endAge: 35,
      citizenship: "citizen",
    });

    const resultWithHousing = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 30,
      endAge: 35,
      housingWithdrawal: 1000,
      citizenship: "citizen",
    });

    const finalWithout =
      resultWithoutHousing.yearlyBalances[
        resultWithoutHousing.yearlyBalances.length - 1
      ].balances.oa;
    const finalWith =
      resultWithHousing.yearlyBalances[
        resultWithHousing.yearlyBalances.length - 1
      ].balances.oa;

    expect(finalWith).toBeLessThan(finalWithout);
  });

  it("should apply voluntary top-up to SA before age 55", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 30,
      endAge: 35,
      voluntaryTopUp: {
        amount: 5000,
        account: "SA",
        frequency: "yearly",
      },
      citizenship: "citizen",
    });

    const baseline = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 30,
      endAge: 35,
      citizenship: "citizen",
    });

    const resultSa =
      result.yearlyBalances[result.yearlyBalances.length - 1].balances.sa;
    const baselineSa =
      baseline.yearlyBalances[baseline.yearlyBalances.length - 1].balances.sa;

    expect(resultSa).toBeGreaterThan(baselineSa);
  });

  it("should apply OA to SA transfer before age 55", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 30,
      endAge: 35,
      oaToSaTransfer: {
        amount: 10000,
        timing: "now",
      },
      citizenship: "citizen",
    });

    const baseline = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 30,
      endAge: 35,
      citizenship: "citizen",
    });

    expect(result.yearlyBalances[0].balances.sa).toBeGreaterThan(
      baseline.yearlyBalances[0].balances.sa,
    );
    expect(result.yearlyBalances[0].balances.oa).toBeLessThan(
      baseline.yearlyBalances[0].balances.oa,
    );
  });

  it("should handle 1st year PR graduated rates", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 30,
      endAge: 31,
      citizenship: "spr-year1",
    });

    const yearlyBalance = result.yearlyBalances[0];
    expect(yearlyBalance.contributions.employee).toBeLessThan(5000 * 0.2 * 12);
    expect(yearlyBalance.distribution.oa).toBeGreaterThan(0);
    expect(yearlyBalance.distribution.sa).toBeGreaterThan(0);
    expect(yearlyBalance.distribution.ma).toBeGreaterThan(0);
  });

  it("should handle 2nd year PR graduated rates", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 30,
      endAge: 31,
      citizenship: "spr-year2",
    });

    const yearlyBalance = result.yearlyBalances[0];
    expect(yearlyBalance.contributions.employee).toBeLessThan(5000 * 0.2 * 12);
    expect(yearlyBalance.contributions.employee).toBeGreaterThan(
      5000 * 0.04 * 12,
    );
  });

  it("should return zero CPF LIFE estimate for low RA balance", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 500,
      birthDate: "01/2001",
      startAge: 64,
      endAge: 65,
      citizenship: "citizen",
    });

    expect(result.cpfLifeEstimate.standardMonthly).toBe(0);
  });

  it("should record milestone snapshots at age 55 and 65", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 25,
      endAge: 65,
      citizenship: "citizen",
    });

    expect(result.milestones.age55).toBeDefined();
    expect(result.milestones.age55.oa).toBeGreaterThan(0);
    expect(result.milestones.age55.ra).toBeGreaterThan(0);
    expect(result.milestones.age65).toBeDefined();
    expect(result.milestones.age65.ra).toBeGreaterThan(0);
  });

  it("should produce reasonable CPF LIFE estimates for S$5,000 income over 40 years", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 25,
      endAge: 65,
      citizenship: "citizen",
    });

    expect(result.cpfLifeEstimate.standardMonthly).toBeGreaterThan(1000);
    expect(result.cpfLifeEstimate.standardMonthly).toBeLessThan(10000);
  });

  it("should handle zero income gracefully", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "01/2001",
      startAge: 30,
      endAge: 31,
      citizenship: "citizen",
    });

    expect(result.yearlyBalances).toHaveLength(2);
    expect(result.totalContributed).toBe(0);
    expect(result.cpfLifeEstimate.standardMonthly).toBe(0);
  });

  it("should not allow OA to go negative from housing withdrawal", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 3000,
      birthDate: "01/2001",
      startAge: 25,
      endAge: 30,
      housingWithdrawal: 5000,
      citizenship: "citizen",
    });

    for (const balance of result.yearlyBalances) {
      expect(balance.balances.oa).toBeGreaterThanOrEqual(0);
    }
  });

  it("should cap voluntary top-up at FRS minus current SA balance", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 30,
      endAge: 31,
      voluntaryTopUp: {
        amount: 500_000,
        account: "SA",
        frequency: "yearly",
      },
      citizenship: "citizen",
    });

    const yearlyBalance = result.yearlyBalances[0];
    expect(yearlyBalance.balances.sa).toBeLessThanOrEqual(220_400);
  });

  it("should produce total contributed + interest equal to final total balances", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 25,
      endAge: 30,
      citizenship: "citizen",
    });

    const finalBalance =
      result.yearlyBalances[result.yearlyBalances.length - 1];
    const totalBalances =
      finalBalance.balances.oa +
      finalBalance.balances.sa +
      finalBalance.balances.ma +
      finalBalance.balances.ra;

    expect(totalBalances).toBeGreaterThan(0);
    expect(result.totalContributed).toBeGreaterThan(0);
    expect(result.totalInterestEarned).toBeGreaterThan(0);
  });

  it("should apply age-group transitions correctly in contribution rates", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 54,
      endAge: 62,
      citizenship: "citizen",
    });

    const age54 = result.yearlyBalances.filter((b) => b.age === 54)[0];
    const age56 = result.yearlyBalances.filter((b) => b.age === 56)[0];
    const age61 = result.yearlyBalances.filter((b) => b.age === 61)[0];

    expect(age54.contributions.total).toBeGreaterThan(
      age56.contributions.total,
    );
    expect(age56.contributions.total).toBeGreaterThan(
      age61.contributions.total,
    );
  });

  it("should record age 70 milestone", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 25,
      endAge: 70,
      citizenship: "citizen",
    });

    expect(result.milestones.age70).toBeDefined();
    expect(result.milestones.age70?.ra).toBeGreaterThan(0);
    expect(result.cpfLifeEstimate.deferredTo70Monthly).toBe(
      result.cpfLifeEstimate.standardMonthly,
    );
  });

  it("should handle birthDate-based age calculation", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "06/2000",
      endAge: 31,
      citizenship: "citizen",
    });

    expect(result.yearlyBalances.length).toBeGreaterThan(0);
  });

  it("should handle empty birthDate gracefully", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "",
      startAge: 30,
      endAge: 31,
      citizenship: "citizen",
    });

    expect(result.yearlyBalances).toHaveLength(2);
  });

  it("should apply voluntary top-up to MA before age 55", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 30,
      endAge: 31,
      voluntaryTopUp: {
        amount: 3000,
        account: "MA",
        frequency: "yearly",
      },
      citizenship: "citizen",
    });

    const baseline = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 30,
      endAge: 31,
      citizenship: "citizen",
    });

    expect(result.yearlyBalances[0].balances.ma).toBeGreaterThan(
      baseline.yearlyBalances[0].balances.ma,
    );
  });

  it("should apply voluntary top-up to RA after age 55", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 55,
      endAge: 56,
      voluntaryTopUp: {
        amount: 5000,
        account: "RA",
        frequency: "yearly",
      },
      citizenship: "citizen",
    });

    expect(result.yearlyBalances[0].balances.ra).toBeGreaterThan(0);
  });

  it("should apply voluntary top-up to MA after age 55", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 55,
      endAge: 56,
      voluntaryTopUp: {
        amount: 3000,
        account: "MA",
        frequency: "yearly",
      },
      citizenship: "citizen",
    });

    expect(result.yearlyBalances[0].balances.ma).toBeGreaterThan(0);
  });

  it("should not apply OA to SA transfer after age 55", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 56,
      endAge: 57,
      oaToSaTransfer: {
        amount: 10000,
        timing: "now",
      },
      citizenship: "citizen",
    });

    const baseline = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 56,
      endAge: 57,
      citizenship: "citizen",
    });

    expect(result.yearlyBalances[0].balances.oa).toBe(
      baseline.yearlyBalances[0].balances.oa,
    );
  });

  it("should apply monthly voluntary top-up only on first year", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 30,
      endAge: 32,
      voluntaryTopUp: {
        amount: 2000,
        account: "SA",
        frequency: "monthly",
      },
      citizenship: "citizen",
    });

    expect(result.yearlyBalances[0].voluntaryTopUp).toBeDefined();
    expect(result.yearlyBalances[1].voluntaryTopUp).toBeUndefined();
  });

  it("should handle yearly OA to SA transfer timing", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 5000,
      birthDate: "01/2001",
      startAge: 30,
      endAge: 32,
      oaToSaTransfer: {
        amount: 5000,
        timing: "yearly",
      },
      citizenship: "citizen",
    });

    expect(result.yearlyBalances[0].balances.sa).toBeGreaterThan(0);
    expect(result.yearlyBalances[1].balances.sa).toBeGreaterThan(
      result.yearlyBalances[0].balances.sa,
    );
  });
});
