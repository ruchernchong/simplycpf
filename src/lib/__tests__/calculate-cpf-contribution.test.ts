import { describe, expect, it } from "vitest";
import {
  type ContributionPolicyError,
  CPF_CONTRIBUTION_SCHEDULES,
  resolveSprContributionYear,
} from "@/policy";
import {
  CITIZEN_MAXIMUM_OW_GOLDEN,
  CITIZENSHIP_SCHEDULE_GOLDEN,
  CPF_BOARD_CALCULATOR_REGRESSION,
  PR_MAXIMUM_OW_GOLDEN,
  WAGE_BAND_BOUNDARY_GOLDEN,
} from "@/policy/__fixtures__/contribution-golden";
import {
  calculateCpfContribution,
  calculateCpfContributionForProjection,
} from "../calculate-cpf-contribution";

describe("calculateCpfContribution official golden vectors", () => {
  it.each([
    ...CITIZEN_MAXIMUM_OW_GOLDEN,
    ...CITIZENSHIP_SCHEDULE_GOLDEN,
    ...PR_MAXIMUM_OW_GOLDEN,
  ])("matches $citizenship $ageBand for $contributionMonth", (fixture) => {
    const result = calculateCpfContribution({
      contributionMonth: fixture.contributionMonth,
      ordinaryWages: fixture.ordinaryWages,
      citizenship: fixture.citizenship,
      age: fixture.age,
    });

    expect(result.contribution).toEqual({
      totalContribution: fixture.total,
      employee: fixture.employee,
      employer: fixture.employer,
    });
    expect(result.age.contributionBand).toBe(fixture.ageBand);
    expect(fixture.source).toMatch(/^https:\/\/www\.cpf\.gov\.sg\//);
    expect(result.policy.contribution.status).toBe("official");
    expect(result.policy.contribution.verifiedAt).toBe("2026-08-01");
  });

  it.each(
    CPF_BOARD_CALCULATOR_REGRESSION,
  )("matches the CPF Board calculator for $citizenship at OW $ordinaryWages", (fixture) => {
    const result = calculateCpfContribution({
      contributionMonth: fixture.contributionMonth,
      ordinaryWages: fixture.ordinaryWages,
      citizenship: fixture.citizenship,
      birthMonth: fixture.birthMonth,
    });

    expect(result.contribution).toEqual({
      totalContribution: fixture.total,
      employee: fixture.employee,
      employer: fixture.employer,
    });
    expect(fixture.calculatorLabel).toBe(
      "CPF Board CPF contribution calculator",
    );
    expect(fixture.verifiedAt).toBe("2026-08-01");
    expect(fixture.sourceUrl).toMatch(/^https:\/\/www\.cpf\.gov\.sg\//);
    expect(fixture.calculatorUrl).toMatch(/^https:\/\/www\.cpf\.gov\.sg\//);
    expect(fixture.note).toContain("Synthetic input");
  });
});

describe("wage bands and statutory rounding", () => {
  it.each(
    WAGE_BAND_BOUNDARY_GOLDEN,
  )("$citizenship at $ordinaryWages uses $wageBand", ({
    ordinaryWages,
    citizenship,
    wageBand,
    total,
    employee,
    employer,
    source,
  }) => {
    const result = calculateCpfContribution({
      contributionMonth: "2026-01",
      ordinaryWages,
      citizenship,
      age: 30,
    });
    expect(result.wageBand).toBe(wageBand);
    expect(result.contribution).toEqual({
      totalContribution: total,
      employee,
      employer,
    });
    expect(source).toMatch(/^https:\/\/www\.cpf\.gov\.sg\//);
  });

  it("rounds total half-up, truncates employee, and makes employer the remainder", () => {
    const result = calculateCpfContribution({
      contributionMonth: "2023-09",
      ordinaryWages: 6300,
      citizenship: "citizen",
      age: 61,
    });
    expect(result.contribution).toEqual({
      totalContribution: 1292,
      employee: 598,
      employer: 694,
    });
  });
});

describe("age and birthday-month transitions", () => {
  it.each([
    [35, "35-and-below"],
    [45, "above-35-to-45"],
    [50, "above-45-to-50"],
    [55, "above-50-to-55"],
    [60, "above-55-to-60"],
    [65, "above-60-to-65"],
    [70, "above-65-to-70"],
  ] as const)("keeps exact age %s in the inclusive upper band", (age, band) => {
    const result = calculateCpfContribution({
      contributionMonth: "2026-01",
      ordinaryWages: 8000,
      citizenship: "citizen",
      age,
    });
    expect(result.age.allocationBand).toBe(band);
  });

  it("moves allocation and contribution bands in the month after a boundary birthday", () => {
    const birthdayMonth = calculateCpfContribution({
      contributionMonth: "2026-01",
      ordinaryWages: 8000,
      citizenship: "citizen",
      birthMonth: "1991-01",
    });
    const followingMonth = calculateCpfContribution({
      contributionMonth: "2026-02",
      ordinaryWages: 8000,
      citizenship: "citizen",
      birthMonth: "1991-01",
    });
    expect(birthdayMonth.age.allocationBand).toBe("35-and-below");
    expect(followingMonth.age.allocationBand).toBe("above-35-to-45");

    const age55Month = calculateCpfContribution({
      contributionMonth: "2026-01",
      ordinaryWages: 8000,
      citizenship: "citizen",
      birthMonth: "1971-01",
    });
    const after55Month = calculateCpfContribution({
      contributionMonth: "2026-02",
      ordinaryWages: 8000,
      citizenship: "citizen",
      birthMonth: "1971-01",
    });
    expect(age55Month.age.contributionBand).toBe("55-and-below");
    expect(after55Month.age.contributionBand).toBe("above-55-to-60");
  });

  it("warns when a completed boundary age omits birth-month context", () => {
    const result = calculateCpfContribution({
      contributionMonth: "2026-08",
      ordinaryWages: 8000,
      citizenship: "citizen",
      age: 55,
    });

    expect(result.age.contributionBand).toBe("55-and-below");
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "age-month-context-required" }),
    );
  });
});

describe("SPR contribution-year transitions", () => {
  it.each([
    ["2026-01", "spr-year1"],
    ["2027-01", "spr-year1"],
    ["2027-02", "spr-year2"],
    ["2028-01", "spr-year2"],
    ["2028-02", "spr-year3-plus"],
  ] as const)("resolves %s from a 15 January 2026 conversion as %s", (contributionMonth, expected) => {
    expect(resolveSprContributionYear("2026-01-15", contributionMonth)).toBe(
      expected,
    );
  });

  it("rejects contribution months before SPR conversion", () => {
    expect(() =>
      resolveSprContributionYear("2026-01-15", "2025-12"),
    ).toThrowError(
      expect.objectContaining<Partial<ContributionPolicyError>>({
        code: "INVALID_INPUT",
      }),
    );
  });
});

describe("OW/AW ceilings and routing", () => {
  it("resolves the September 2023 OW ceiling transition by contribution month", () => {
    const august = calculateCpfContribution({
      contributionMonth: "2023-08",
      ordinaryWages: 6300,
      citizenship: "citizen",
      age: 30,
    });
    const september = calculateCpfContribution({
      contributionMonth: "2023-09",
      ordinaryWages: 6300,
      citizenship: "citizen",
      age: 30,
    });
    expect(august.subjectWages.ordinaryWages).toBe(6000);
    expect(august.contribution.totalContribution).toBe(2220);
    expect(september.subjectWages.ordinaryWages).toBe(6300);
    expect(september.contribution.totalContribution).toBe(2331);
  });

  it("requires annual context and caps Additional Wages without guessing", () => {
    expect(() =>
      calculateCpfContribution({
        contributionMonth: "2026-01",
        ordinaryWages: 8000,
        additionalWages: 10000,
        citizenship: "citizen",
        age: 30,
      }),
    ).toThrowError(
      expect.objectContaining<Partial<ContributionPolicyError>>({
        code: "AW_CONTEXT_REQUIRED",
      }),
    );

    const result = calculateCpfContribution({
      contributionMonth: "2026-01",
      ordinaryWages: 8000,
      additionalWages: 10000,
      additionalWageCeilingContext: {
        annualOrdinaryWagesSubjectToCpf: 96000,
        priorAdditionalWagesSubjectToCpf: 2000,
      },
      citizenship: "citizen",
      age: 30,
    });
    expect(result.subjectWages.additionalWages).toBe(4000);
    expect(result.contribution).toEqual({
      totalContribution: 4440,
      employee: 2400,
      employer: 2040,
    });
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "additional-wages-capped" }),
    );
  });

  it("allocates MA, then RA, then OA remainder and exposes both FRS branches", () => {
    const result = calculateCpfContribution({
      contributionMonth: "2026-01",
      ordinaryWages: 8000,
      citizenship: "citizen",
      age: 56,
    });
    expect(result.distribution).toEqual({
      OA: 960.16,
      RA: 919.9,
      MA: 839.94,
    });
    expect(result.routing).toEqual({
      selected: "undetermined",
      rule: "RA until FRS, then OA",
      branches: {
        beforeFullRetirementSum: { OA: 960.16, RA: 919.9, MA: 839.94 },
        afterFullRetirementSum: { OA: 1880.06, RA: 0, MA: 839.94 },
      },
    });

    const afterFrs = calculateCpfContribution({
      contributionMonth: "2026-01",
      ordinaryWages: 8000,
      citizenship: "citizen",
      age: 56,
      hasReachedFullRetirementSum: true,
    });
    expect(afterFrs.distribution).toEqual({ OA: 1880.06, RA: 0, MA: 839.94 });
  });

  it("uses SA before the 2025 closure schedule", () => {
    const result = calculateCpfContribution({
      contributionMonth: "2024-01",
      ordinaryWages: 6800,
      citizenship: "citizen",
      age: 56,
    });
    expect(result.distribution.SA).toBeGreaterThan(0);
    expect(result.distribution.RA).toBeUndefined();
  });
});

describe("policy support and invariants", () => {
  it("rejects unsupported citizenship values at runtime", () => {
    expect(() =>
      Reflect.apply(calculateCpfContribution, undefined, [
        {
          contributionMonth: "2026-01",
          ordinaryWages: 8000,
          citizenship: "unsupported",
          age: 30,
        },
      ]),
    ).toThrowError(
      expect.objectContaining<Partial<ContributionPolicyError>>({
        code: "INVALID_INPUT",
      }),
    );
  });

  it("rejects unsupported official years and only freezes for projections", () => {
    expect(() =>
      calculateCpfContribution({
        contributionMonth: "2028-01",
        ordinaryWages: 8000,
        citizenship: "citizen",
        age: 30,
      }),
    ).toThrowError(
      expect.objectContaining<Partial<ContributionPolicyError>>({
        code: "UNSUPPORTED_POLICY_MONTH",
      }),
    );

    const assumed = calculateCpfContributionForProjection({
      contributionMonth: "2030-06",
      ordinaryWages: 8000,
      citizenship: "citizen",
      age: 61,
    });
    expect(assumed.schedule.status).toBe("assumed");
    expect(assumed.policy.contribution.status).toBe("assumed");
    expect(assumed.warnings).toContainEqual(
      expect.objectContaining({ code: "policy-frozen" }),
    );
  });

  it("preserves contribution and allocation sums across every official schedule", () => {
    const citizenships = [
      "citizen",
      "spr-year1",
      "spr-year2",
      "spr-year3-plus",
    ] as const;
    const ages = [30, 35, 40, 45, 48, 50, 55, 56, 60, 61, 65, 66, 70, 71];
    const wages = [0, 50, 50.01, 500, 500.01, 750, 750.01, 1000, 10000];

    for (const schedule of CPF_CONTRIBUTION_SCHEDULES) {
      for (const citizenship of citizenships) {
        for (const age of ages) {
          for (const ordinaryWages of wages) {
            const result = calculateCpfContribution({
              contributionMonth: schedule.effectiveFrom.slice(0, 7),
              ordinaryWages,
              citizenship,
              age,
              hasReachedFullRetirementSum: false,
            });
            expect(
              result.contribution.employee + result.contribution.employer,
            ).toBe(result.contribution.totalContribution);
            const allocated = Object.values(result.distribution).reduce(
              (sum, value) => sum + value,
              0,
            );
            expect(Math.round(allocated * 100)).toBe(
              result.contribution.totalContribution * 100,
            );
            if (age < 55) expect(result.distribution.RA).toBeUndefined();
          }
        }
      }
    }
  });

  it("retains the deprecated positional signature for one compatibility cycle", () => {
    const result = calculateCpfContribution(8000, "2026-01-01", { age: 30 });
    expect(result.contribution).toEqual({
      totalContribution: 2960,
      employee: 1600,
      employer: 1360,
    });
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "legacy-input" }),
    );
  });

  it("labels the legacy historical-ceiling comparison as an assumption", () => {
    const result = calculateCpfContribution(8000, "2026-01", {
      age: 30,
      useCeilingBeforeSep2023: true,
    });
    expect(result.schedule.ordinaryWageCeiling).toBe(6000);
    expect(result.schedule.status).toBe("assumed");
    expect(result.policy.wageCeiling.status).toBe("assumed");
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "legacy-rate-override" }),
    );
  });
});
