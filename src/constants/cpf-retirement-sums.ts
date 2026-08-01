import type { PolicyMetadata } from "@/policy";
import { getPolicyMetadata, POLICY_SOURCES } from "@/policy";

export const FRS_MULTIPLIER_OF_BRS = 2;
export const ERS_MULTIPLIER_OF_FRS = 2;

export const CPF_RETIREMENT_SUMS_SOURCE_URL = POLICY_SOURCES.retirementSums.url;

export const CPF_RETIREMENT_SUMS_VERIFIED_AT = "2026-08-01";

export interface RetirementSums {
  brs: number;
  frs: number;
  ers: number;
}

export interface RetirementSumsPolicyValue {
  value: RetirementSums;
  metadata: PolicyMetadata;
}

export interface CohortRetirementThresholds {
  brs: number;
  frs: number;
  metadata: PolicyMetadata;
}

/** Official FRS by the year a member's 55th birthday falls in. */
export const CPF_COHORT_FULL_RETIREMENT_SUM: Record<string, number> = {
  "1995": 40_000,
  "1996": 45_000,
  "1997": 50_000,
  "1998": 55_000,
  "1999": 60_000,
  "2000": 65_000,
  "2001": 70_000,
  "2002": 75_000,
  "2003": 80_000,
  "2004": 84_500,
  "2005": 90_000,
  "2006": 94_600,
  "2007": 99_600,
  "2008": 106_000,
  "2009": 117_000,
  "2010": 123_000,
  "2011": 131_000,
  "2012": 139_000,
  "2013": 148_000,
  "2014": 155_000,
  "2015": 161_000,
  "2016": 161_000,
  "2017": 166_000,
  "2018": 171_000,
  "2019": 176_000,
  "2020": 181_000,
  "2021": 186_000,
  "2022": 192_000,
  "2023": 198_800,
  "2024": 205_800,
  "2025": 213_000,
  "2026": 220_400,
  "2027": 228_200,
};

/** Published sums for cohorts turning 55 in 2023 through 2027. */
export const CPF_RETIREMENT_SUMS: Record<string, RetirementSums> = {
  "2023": { brs: 99_400, frs: 198_800, ers: 298_200 },
  "2024": { brs: 102_900, frs: 205_800, ers: 308_700 },
  "2025": { brs: 106_500, frs: 213_000, ers: 426_000 },
  "2026": { brs: 110_200, frs: 220_400, ers: 440_800 },
  "2027": { brs: 114_100, frs: 228_200, ers: 456_400 },
};

function officialMetadata(year: number): PolicyMetadata {
  return getPolicyMetadata("cpf-retirement-sums", {
    version: String(year),
    effectiveFrom: `${year}-01-01`,
    effectiveTo: `${year}-12-31`,
  });
}

/** Returns only a published retirement-sum year. */
export function getRetirementSumsForYear(year: number): RetirementSums {
  const value = CPF_RETIREMENT_SUMS[String(year)];
  if (value === undefined) {
    throw new RangeError(
      `No official CPF retirement sums are published for ${year}.`,
    );
  }
  return value;
}

/** Holds 2027 sums constant for unpublished future projection years. */
export function getRetirementSumsForProjection(
  year: number,
): RetirementSumsPolicyValue {
  const official = CPF_RETIREMENT_SUMS[String(year)];
  if (official !== undefined) {
    return { value: official, metadata: officialMetadata(year) };
  }

  if (year < 2023) {
    throw new RangeError(
      `Projection retirement sums before 2023 are outside the supported policy catalogue (${year}).`,
    );
  }

  return {
    value: CPF_RETIREMENT_SUMS["2027"],
    metadata: getPolicyMetadata("cpf-retirement-sums", {
      version: `${year}-freeze-2027`,
      status: "assumed",
      effectiveFrom: `${year}-01-01`,
      effectiveTo: `${year}-12-31`,
      notes: [
        "No later retirement sums have been published; the 2027 sums are held constant without extrapolation.",
      ],
    }),
  };
}

/** Resolves the BRS/FRS fixed for the member's age-55 cohort. */
export function getCohortRetirementThresholds(
  yearTurned55: number,
): CohortRetirementThresholds {
  const officialFrs = CPF_COHORT_FULL_RETIREMENT_SUM[String(yearTurned55)];
  if (officialFrs !== undefined) {
    return {
      brs: officialFrs / 2,
      frs: officialFrs,
      metadata: officialMetadata(yearTurned55),
    };
  }

  if (yearTurned55 < 1995) {
    throw new RangeError(
      `No sourced cohort retirement sum is available for ${yearTurned55}.`,
    );
  }

  const latestFrs = CPF_COHORT_FULL_RETIREMENT_SUM["2027"];
  return {
    brs: latestFrs / 2,
    frs: latestFrs,
    metadata: getPolicyMetadata("cpf-retirement-sums", {
      version: `${yearTurned55}-freeze-2027`,
      status: "assumed",
      effectiveFrom: `${yearTurned55}-01-01`,
      effectiveTo: `${yearTurned55}-12-31`,
      notes: [
        "No later cohort FRS has been published; the 2027 BRS and FRS are held constant without extrapolation.",
      ],
    }),
  };
}
