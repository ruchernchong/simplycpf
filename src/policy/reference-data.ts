import { CPF_POLICY_VERIFIED_AT, POLICY_SOURCES } from "./sources";

interface OfficialPolicyFields {
  status: "official";
  verifiedAt: typeof CPF_POLICY_VERIFIED_AT;
  sourceUrls: readonly string[];
}

function officialPolicyFields(
  ...sourceUrls: readonly string[]
): OfficialPolicyFields {
  return {
    status: "official",
    verifiedAt: CPF_POLICY_VERIFIED_AT,
    sourceUrls,
  };
}

export interface BasicHealthcareSumRow extends OfficialPolicyFields {
  year: number;
  amount: number;
  effectiveFrom: string;
  effectiveTo: string;
  cohortBirthYearAtOrBefore?: number;
}

/**
 * Published BHS amounts. The 2016 row also covers members born in 1951 or
 * earlier; later rows identify the cohort turning 65 in that calendar year.
 */
export const CPF_BASIC_HEALTHCARE_SUM_ROWS: readonly BasicHealthcareSumRow[] = [
  { year: 2016, amount: 49_800, cohortBirthYearAtOrBefore: 1951 },
  { year: 2017, amount: 52_000 },
  { year: 2018, amount: 54_500 },
  { year: 2019, amount: 57_200 },
  { year: 2020, amount: 60_000 },
  { year: 2021, amount: 63_000 },
  { year: 2022, amount: 66_000 },
  { year: 2023, amount: 68_500 },
  { year: 2024, amount: 71_500 },
  { year: 2025, amount: 75_500 },
  { year: 2026, amount: 79_000 },
].map((row) => ({
  ...row,
  effectiveFrom: `${row.year}-01-01`,
  effectiveTo: `${row.year}-12-31`,
  ...officialPolicyFields(POLICY_SOURCES.basicHealthcareSum.url),
}));

export interface CohortFullRetirementSumRow extends OfficialPolicyFields {
  /** First 55th birthday to which this fixed FRS applies. */
  effectiveFrom: string;
  /** Last 55th birthday to which this fixed FRS applies. */
  effectiveTo: string;
  fullRetirementSum: number;
}

const COHORT_FULL_RETIREMENT_SUM_THRESHOLDS = [
  ["1995-07-01", "1996-06-30", 40_000],
  ["1996-07-01", "1997-06-30", 45_000],
  ["1997-07-01", "1998-06-30", 50_000],
  ["1998-07-01", "1999-06-30", 55_000],
  ["1999-07-01", "2000-06-30", 60_000],
  ["2000-07-01", "2001-06-30", 65_000],
  ["2001-07-01", "2002-06-30", 70_000],
  ["2002-07-01", "2003-06-30", 75_000],
  ["2003-07-01", "2004-06-30", 80_000],
  ["2004-07-01", "2005-06-30", 84_500],
  ["2005-07-01", "2006-06-30", 90_000],
  ["2006-07-01", "2007-06-30", 94_600],
  ["2007-07-01", "2008-06-30", 99_600],
  ["2008-07-01", "2009-06-30", 106_000],
  ["2009-07-01", "2010-06-30", 117_000],
  ["2010-07-01", "2011-06-30", 123_000],
  ["2011-07-01", "2012-06-30", 131_000],
  ["2012-07-01", "2013-06-30", 139_000],
  ["2013-07-01", "2014-06-30", 148_000],
  ["2014-07-01", "2015-06-30", 155_000],
  ["2015-07-01", "2016-12-31", 161_000],
  ["2017-01-01", "2017-12-31", 166_000],
  ["2018-01-01", "2018-12-31", 171_000],
  ["2019-01-01", "2019-12-31", 176_000],
  ["2020-01-01", "2020-12-31", 181_000],
  ["2021-01-01", "2021-12-31", 186_000],
  ["2022-01-01", "2022-12-31", 192_000],
  ["2023-01-01", "2023-12-31", 198_800],
  ["2024-01-01", "2024-12-31", 205_800],
  ["2025-01-01", "2025-12-31", 213_000],
  ["2026-01-01", "2026-12-31", 220_400],
  ["2027-01-01", "2027-12-31", 228_200],
] as const;

/** Exact effective-date FRS thresholds from CPF Board's historical PDF. */
export const CPF_COHORT_FULL_RETIREMENT_SUM_ROWS: readonly CohortFullRetirementSumRow[] =
  COHORT_FULL_RETIREMENT_SUM_THRESHOLDS.map(
    ([effectiveFrom, effectiveTo, fullRetirementSum]) => ({
      effectiveFrom,
      effectiveTo,
      fullRetirementSum,
      ...officialPolicyFields(POLICY_SOURCES.historicalFullRetirementSums.url),
    }),
  );

export interface RetirementSumRow extends OfficialPolicyFields {
  year: number;
  effectiveFrom: string;
  effectiveTo: string;
  brs: number;
  frs: number;
  ers: number;
  ersMultipleOfBrs: 3 | 4;
}

const RETIREMENT_SUM_VALUES = [
  {
    year: 2023,
    brs: 99_400,
    frs: 198_800,
    ers: 298_200,
    ersMultipleOfBrs: 3,
  },
  {
    year: 2024,
    brs: 102_900,
    frs: 205_800,
    ers: 308_700,
    ersMultipleOfBrs: 3,
  },
  {
    year: 2025,
    brs: 106_500,
    frs: 213_000,
    ers: 426_000,
    ersMultipleOfBrs: 4,
  },
  {
    year: 2026,
    brs: 110_200,
    frs: 220_400,
    ers: 440_800,
    ersMultipleOfBrs: 4,
  },
  {
    year: 2027,
    brs: 114_100,
    frs: 228_200,
    ers: 456_400,
    ersMultipleOfBrs: 4,
  },
] as const;

/** Published BRS, FRS and ERS values; ERS rose from 3x to 4x BRS in 2025. */
export const CPF_RETIREMENT_SUM_ROWS: readonly RetirementSumRow[] =
  RETIREMENT_SUM_VALUES.map((row) => ({
    ...row,
    effectiveFrom: `${row.year}-01-01`,
    effectiveTo: `${row.year}-12-31`,
    ...officialPolicyFields(
      row.year <= 2024
        ? POLICY_SOURCES.retirementSums2023To2027.url
        : POLICY_SOURCES.retirementSums.url,
    ),
  }));

const CPF_LIFE_REFERENCE_EFFECTIVE_FROM = "2026-01-01";
const CPF_LIFE_REFERENCE_EFFECTIVE_TO = "2026-12-31";

export interface CpfLifeReferenceRow extends OfficialPolicyFields {
  effectiveFrom: "2026-01-01";
  effectiveTo: "2026-12-31";
  raAt55: number;
  raAt65: number;
  monthlyPayoutAt65: number;
  monthlyPayoutAt70: number;
  label?: string;
}

/**
 * CPF Board's exact 2026 reference rows for a male member on the CPF LIFE
 * Standard Plan. They are reference examples and must not be interpolated.
 */
export const CPF_LIFE_2026_REFERENCE_ROWS: readonly CpfLifeReferenceRow[] = [
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
    label: "2026 Basic Retirement Sum",
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
    label: "2026 Full Retirement Sum",
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
    label: "2026 Enhanced Retirement Sum",
  },
].map((row) => ({
  ...row,
  effectiveFrom: CPF_LIFE_REFERENCE_EFFECTIVE_FROM,
  effectiveTo: CPF_LIFE_REFERENCE_EFFECTIVE_TO,
  ...officialPolicyFields(POLICY_SOURCES.cpfLifeReferencePayouts.url),
}));

export const CPF_LIFE_POLICY = {
  effectiveFrom: "2026-01-01",
  payoutStart: {
    earliestAge: 65,
    latestAge: 70,
    deferral: {
      maximumIncreasePerYearPercent: 7,
      maximumDeferralYears: 5,
      maximumCumulativeIncreasePercent: 35,
    },
  },
  voluntaryEnrollment: {
    earliestAge: 65,
    latestAgeExclusive: 80,
    latestTiming: "one month before age 80",
    minimumSavingsRequired: false,
  },
  automaticInclusion: {
    singaporeCitizenOrPermanentResident: true,
    bornOnOrAfter: "1958-01-01",
    minimumRetirementSavingsAtPayoutStart: 60_000,
    note: "The S$60,000 condition is for automatic inclusion. It is not a minimum balance to join CPF LIFE or receive a payout.",
  },
  plans: {
    escalating: {
      payoutPattern: "starts lower and grows yearly for life",
      annualIncreasePercent: 2,
    },
    standard: {
      payoutPattern: "steady monthly payout",
      growsWithInflation: false,
    },
    basic: {
      payoutPattern: "starts lower and becomes progressively lower",
      declineCondition: {
        combinedCpfBalancesBelow: 60_000,
        reason:
          "extra interest decreases as the remaining combined CPF balances fall below S$60,000",
      },
    },
    common: {
      payoutsContinueForLife: true,
    },
  },
  reference: {
    year: 2026,
    plan: "Standard",
    profile: "male",
    rows: CPF_LIFE_2026_REFERENCE_ROWS,
    personalisedEstimatorUrl:
      "https://www.cpf.gov.sg/member/retirement-income/about-cpf-planner-retirement-income",
    note: "Reference figures only. Actual payouts depend on individual circumstances and prevailing CPF LIFE parameters.",
  },
  ...officialPolicyFields(
    POLICY_SOURCES.cpfLife.url,
    POLICY_SOURCES.cpfLifeEligibility.url,
    POLICY_SOURCES.cpfLifeReferencePayouts.url,
  ),
} as const;

export function findPublishedBhs(year: number): BasicHealthcareSumRow | null {
  return CPF_BASIC_HEALTHCARE_SUM_ROWS.find((row) => row.year === year) ?? null;
}

export function findPublishedRetirementSums(
  year: number,
): RetirementSumRow | null {
  return CPF_RETIREMENT_SUM_ROWS.find((row) => row.year === year) ?? null;
}

export function findCohortFullRetirementSum(
  fiftyFifthBirthday: string,
): CohortFullRetirementSumRow | null {
  return (
    CPF_COHORT_FULL_RETIREMENT_SUM_ROWS.find(
      (row) =>
        fiftyFifthBirthday >= row.effectiveFrom &&
        fiftyFifthBirthday <= row.effectiveTo,
    ) ?? null
  );
}
