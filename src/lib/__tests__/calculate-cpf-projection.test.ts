import { describe, expect, it } from "vitest";
import { CPF_LIFE_2026_REFERENCE } from "@/constants/cpf-life";
import { calculateCpfProjection } from "../calculate-cpf-projection";

function zeroBalances() {
  return { oa: 0, sa: 0, ma: 0, ra: 0 };
}

describe("calculateCpfProjection monthly ledger", () => {
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

  it("keeps the age-55 rate through the birthday month", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 8_000,
      birthDate: "12/1970",
      startMonth: "2026-12",
      endAge: 56,
      citizenship: "citizen",
      initialBalances: zeroBalances(),
    });

    expect(result.yearlyBalances[0].month).toBe("2026-12");
    expect(result.yearlyBalances[0].contributions.total).toBe(2_960);
  });

  it("moves to the next contribution band in the month after the birthday", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 8_000,
      birthDate: "12/1970",
      startMonth: "2027-01",
      endAge: 56,
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

  it("closes SA and routes SA then OA into RA at age 55", () => {
    const result = calculateCpfProjection({
      monthlyIncome: 0,
      birthDate: "12/1971",
      startMonth: "2026-11",
      endAge: 55,
      citizenship: "citizen",
      initialBalances: { oa: 100_000, sa: 150_000, ma: 0, ra: 0 },
    });

    expect(result.milestones.age55.sa).toBe(0);
    expect(result.milestones.age55.ra).toBeGreaterThan(220_400);
    expect(result.milestones.age55.oa).toBeGreaterThan(29_000);
  });

  it("keeps both official retirement-routing contexts available", () => {
    const common = {
      monthlyIncome: 0,
      birthDate: "01/1970",
      startMonth: "2026-12",
      endAge: 56,
      citizenship: "citizen" as const,
      initialBalances: { oa: 100_000, sa: 0, ma: 0, ra: 150_000 },
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
    expect(property.yearlyBalances[0].balances.oa).toBeGreaterThan(
      full.yearlyBalances[0].balances.oa,
    );
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
    expect(row2026?.topUpTaxReliefEligible).toBe(8_000);
    expect(row2027?.voluntaryTopUp).toBe(1_000);
    expect(row2027?.topUpTaxReliefEligible).toBe(1_000);
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
    expect(row.topUpTaxReliefEligible).toBe(8_000);
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
