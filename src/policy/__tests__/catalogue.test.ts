import { describe, expect, it } from "vitest";
import {
  CPF_BASIC_HEALTHCARE_SUM_ROWS,
  CPF_COHORT_FULL_RETIREMENT_SUM_ROWS,
  CPF_CONTRIBUTION_SCHEDULES,
  CPF_INTEREST_RATE_METHODOLOGY,
  CPF_LIFE_POLICY,
  CPF_POLICY_CATALOGUE,
  CPF_POLICY_RULES,
  CPF_QUARTERLY_INTEREST_RATES,
  CPF_RETIREMENT_SUM_ROWS,
  POLICY_METADATA,
} from "@/policy";

describe("CPF policy catalogue", () => {
  it("provides first-party provenance for every registered dataset", () => {
    for (const metadata of Object.values(POLICY_METADATA)) {
      expect(metadata.verifiedAt).toBe("2026-08-01");
      expect(metadata.status).toBe("official");
      expect(metadata.sources.length).toBeGreaterThan(0);
      for (const source of metadata.sources) {
        expect(source.url).toMatch(
          /^https:\/\/(?:www\.)?(?:cpf\.gov\.sg|iras\.gov\.sg|mom\.gov\.sg)\//,
        );
      }
    }
  });

  it("is versioned and aggregates schedules, metadata, sources and small rules", () => {
    expect(CPF_POLICY_CATALOGUE.version).toBe("2.0.0");
    expect(CPF_POLICY_CATALOGUE.contributionSchedules).toBe(
      CPF_CONTRIBUTION_SCHEDULES,
    );
    expect(CPF_POLICY_CATALOGUE.rules).toBe(CPF_POLICY_RULES);
    expect(CPF_POLICY_RULES.wageBands).toMatchObject({
      noContributionAtOrBelow: 50,
      employerOnlyAtOrBelow: 500,
      phasedEmployeeShareAtOrBelow: 750,
      fullRatesAbove: 750,
      annualAdditionalWageCeiling: 102000,
      status: "official",
      verifiedAt: "2026-08-01",
    });
    expect(CPF_POLICY_RULES.age55PropertyPledge).toMatchObject({
      qualifyingLeaseMustLastThroughAge: 95,
      maximumPropertyComponentOfFrs: 0.5,
      status: "official",
      verifiedAt: "2026-08-01",
    });
    expect(CPF_POLICY_RULES.retirementWithdrawals).toMatchObject({
      cohortBornOnOrAfter: "1958-01-01",
      fromAge55: {
        unconditionalAmount: 5000,
        propertyOption: {
          minimumRemainingLeaseThroughAge: 95,
          retirementAccountFloor: "BRS",
        },
      },
      fromAge65: {
        additionalRetirementSavingsPercentage: 20,
        lessAge55WithdrawableAmount: 5000,
      },
      status: "official",
      verifiedAt: "2026-08-01",
    });
    expect(CPF_POLICY_RULES.lifecycleAges.basicHealthcareSumFrozen).toBe(65);
    expect(CPF_POLICY_RULES.retirementTopUps.taxRelief).toMatchObject({
      selfAnnualCap: 8000,
      familyAnnualCap: 8000,
      combinedAnnualCap: 16000,
      spouseOrSiblingIncomeCondition: 8000,
      spouseOrSiblingIncomeThresholdFromYearOfAssessment: 2025,
      overallPersonalReliefCap: 80000,
      cashTopUpsOnly: true,
      cpfTransfersQualify: false,
      matchingGrantTopUpsQualify: false,
    });
  });

  it("contains complete, non-overlapping official schedules through 2027", () => {
    expect(
      CPF_CONTRIBUTION_SCHEDULES.map((schedule) => [
        schedule.effectiveFrom,
        schedule.effectiveTo,
      ]),
    ).toEqual([
      ["2023-01-01", "2023-08-31"],
      ["2023-09-01", "2023-12-31"],
      ["2024-01-01", "2024-12-31"],
      ["2025-01-01", "2025-12-31"],
      ["2026-01-01", "2026-12-31"],
      ["2027-01-01", "2027-12-31"],
    ]);

    for (const schedule of CPF_CONTRIBUTION_SCHEDULES) {
      expect(schedule.citizenRates).toHaveLength(5);
      expect(schedule.sprYear1Rates).toHaveLength(5);
      expect(schedule.sprYear2Rates).toHaveLength(5);
      expect(schedule.allocationRates).toHaveLength(8);
      for (const allocation of schedule.allocationRates) {
        expect(
          allocation.oaBasisPoints +
            allocation.retirementBasisPoints +
            allocation.maBasisPoints,
        ).toBe(10000);
      }
      expect(schedule.contributionMetadata.sources[0]?.url).toMatch(/\.pdf$/);
      expect(schedule.allocationMetadata.sources[0]?.url).toMatch(/\.pdf$/);
    }
  });

  it("contains CPF Board's complete published BHS cohort table", () => {
    expect(
      CPF_BASIC_HEALTHCARE_SUM_ROWS.map(({ year, amount }) => [year, amount]),
    ).toEqual([
      [2016, 49_800],
      [2017, 52_000],
      [2018, 54_500],
      [2019, 57_200],
      [2020, 60_000],
      [2021, 63_000],
      [2022, 66_000],
      [2023, 68_500],
      [2024, 71_500],
      [2025, 75_500],
      [2026, 79_000],
    ]);
    expect(CPF_BASIC_HEALTHCARE_SUM_ROWS[0]).toMatchObject({
      cohortBirthYearAtOrBefore: 1951,
      status: "official",
      verifiedAt: "2026-08-01",
    });
  });

  it("preserves historical FRS birthday cutovers and published 2023–2027 sums", () => {
    expect(CPF_COHORT_FULL_RETIREMENT_SUM_ROWS).toContainEqual(
      expect.objectContaining({
        effectiveFrom: "2015-07-01",
        effectiveTo: "2016-12-31",
        fullRetirementSum: 161_000,
      }),
    );
    expect(CPF_COHORT_FULL_RETIREMENT_SUM_ROWS.at(-1)).toMatchObject({
      effectiveFrom: "2027-01-01",
      effectiveTo: "2027-12-31",
      fullRetirementSum: 228_200,
    });
    expect(
      CPF_RETIREMENT_SUM_ROWS.map(({ year, brs, frs, ers }) => ({
        year,
        brs,
        frs,
        ers,
      })),
    ).toEqual([
      { year: 2023, brs: 99_400, frs: 198_800, ers: 298_200 },
      { year: 2024, brs: 102_900, frs: 205_800, ers: 308_700 },
      { year: 2025, brs: 106_500, frs: 213_000, ers: 426_000 },
      { year: 2026, brs: 110_200, frs: 220_400, ers: 440_800 },
      { year: 2027, brs: 114_100, frs: 228_200, ers: 456_400 },
    ]);
  });

  it("stores exact CPF LIFE reference rows without an invented payout formula", () => {
    expect(CPF_LIFE_POLICY.voluntaryEnrollment).toMatchObject({
      earliestAge: 65,
      latestAgeExclusive: 80,
      minimumSavingsRequired: false,
    });
    expect(CPF_LIFE_POLICY.automaticInclusion).toMatchObject({
      bornOnOrAfter: "1958-01-01",
      minimumRetirementSavingsAtPayoutStart: 60_000,
    });
    expect(CPF_LIFE_POLICY.plans).toMatchObject({
      escalating: { annualIncreasePercent: 2 },
      standard: { growsWithInflation: false },
      basic: { declineCondition: { combinedCpfBalancesBelow: 60_000 } },
      common: { payoutsContinueForLife: true },
    });
    expect(
      CPF_LIFE_POLICY.reference.rows.map(
        ({ raAt55, raAt65, monthlyPayoutAt65, monthlyPayoutAt70 }) => ({
          raAt55,
          raAt65,
          monthlyPayoutAt65,
          monthlyPayoutAt70,
        }),
      ),
    ).toEqual([
      {
        raAt55: 50_000,
        raAt65: 82_400,
        monthlyPayoutAt65: 490,
        monthlyPayoutAt70: 670,
      },
      {
        raAt55: 110_200,
        raAt65: 170_100,
        monthlyPayoutAt65: 950,
        monthlyPayoutAt70: 1_280,
      },
      {
        raAt55: 150_000,
        raAt65: 227_900,
        monthlyPayoutAt65: 1_250,
        monthlyPayoutAt70: 1_670,
      },
      {
        raAt55: 220_400,
        raAt65: 330_100,
        monthlyPayoutAt65: 1_780,
        monthlyPayoutAt70: 2_380,
      },
      {
        raAt55: 300_000,
        raAt65: 445_600,
        monthlyPayoutAt65: 2_380,
        monthlyPayoutAt70: 3_170,
      },
      {
        raAt55: 440_800,
        raAt65: 650_100,
        monthlyPayoutAt65: 3_440,
        monthlyPayoutAt70: 4_580,
      },
    ]);
  });

  it("contains official quarterly declarations through 2026 Q3 and the documented peg", () => {
    expect(CPF_QUARTERLY_INTEREST_RATES).toHaveLength(15);
    expect(CPF_QUARTERLY_INTEREST_RATES[2]).toMatchObject({
      quarter: "2023 Q3",
      oa: 2.5,
      sa: 4.01,
      ma: 4.01,
      ra: 4,
    });
    expect(CPF_QUARTERLY_INTEREST_RATES.at(-1)).toMatchObject({
      quarter: "2026 Q3",
      effectiveFrom: "2026-07-01",
      effectiveTo: "2026-09-30",
      oa: 2.5,
      sa: 4,
      ma: 4,
      ra: 4,
    });
    expect(
      CPF_INTEREST_RATE_METHODOLOGY.specialMediSaveRetirementAccounts,
    ).toMatchObject({
      markupPercentagePoints: 1,
      floorRate: 4,
      floorGuaranteedThrough: "2026-12-31",
      reviewFrequency: "quarterly",
    });
  });

  it("attaches official provenance to every reference row", () => {
    const rows = [
      ...CPF_BASIC_HEALTHCARE_SUM_ROWS,
      ...CPF_COHORT_FULL_RETIREMENT_SUM_ROWS,
      ...CPF_RETIREMENT_SUM_ROWS,
      ...CPF_LIFE_POLICY.reference.rows,
    ];
    for (const row of rows) {
      expect(row.status).toBe("official");
      expect(row.verifiedAt).toBe("2026-08-01");
      expect(row.sourceUrls.length).toBeGreaterThan(0);
      for (const sourceUrl of row.sourceUrls) {
        expect(sourceUrl).toMatch(/^https:\/\/www\.cpf\.gov\.sg\//);
      }
    }

    for (const row of CPF_QUARTERLY_INTEREST_RATES) {
      expect(row.status).toBe("official");
      expect(row.verifiedAt).toBe("2026-08-01");
      expect(row.sourceUrl).toMatch(/^https:\/\/www\.cpf\.gov\.sg\//);
    }
  });
});
