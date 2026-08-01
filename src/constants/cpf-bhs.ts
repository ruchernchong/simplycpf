import type { PolicyMetadata } from "@/policy";
import { getPolicyMetadata, POLICY_SOURCES } from "@/policy";

export const CPF_BHS_SOURCE_URL = POLICY_SOURCES.basicHealthcareSum.url;

export const CPF_BHS_VERIFIED_AT = "2026-08-01";

/**
 * Published BHS amounts for members below 65 and for the cohort turning 65 in
 * each year. Members born in 1951 or earlier have a fixed BHS of S$49,800.
 */
export const CPF_BASIC_HEALTHCARE_SUM: Record<string, number> = {
  "2016": 49_800,
  "2017": 52_000,
  "2018": 54_500,
  "2019": 57_200,
  "2020": 60_000,
  "2021": 63_000,
  "2022": 66_000,
  "2023": 68_500,
  "2024": 71_500,
  "2025": 75_500,
  "2026": 79_000,
};

export interface BhsPolicyValue {
  value: number;
  metadata: PolicyMetadata;
  cohortYear: number;
}

function officialMetadata(year: number): PolicyMetadata {
  return getPolicyMetadata("cpf-basic-healthcare-sum", {
    version: String(year),
    effectiveFrom: `${year}-01-01`,
    effectiveTo: `${year}-12-31`,
  });
}

/** Returns only a published BHS year; unsupported years are never clamped. */
export function getBhsForYear(year: number): number {
  const value = CPF_BASIC_HEALTHCARE_SUM[String(year)];
  if (value === undefined) {
    throw new RangeError(
      `No official Basic Healthcare Sum is published for ${year}.`,
    );
  }
  return value;
}

/**
 * Resolves the BHS for a projection. A member's BHS freezes in the year they
 * turn 65. For an unpublished future year, the last published amount is held
 * constant and explicitly marked as an assumption.
 */
export function getBhsForProjection(
  year: number,
  memberBirthYear: number,
): BhsPolicyValue {
  const cohortYear = memberBirthYear + 65;
  const applicableYear = Math.min(year, cohortYear);

  if (applicableYear <= 2016) {
    return {
      value: CPF_BASIC_HEALTHCARE_SUM["2016"],
      cohortYear,
      metadata: {
        ...officialMetadata(2016),
        notes: [
          "CPF Board publishes S$49,800 for members born in 1951 or earlier (the 2016-or-earlier cohort).",
        ],
      },
    };
  }

  const official = CPF_BASIC_HEALTHCARE_SUM[String(applicableYear)];
  if (official !== undefined) {
    return {
      value: official,
      cohortYear,
      metadata: officialMetadata(applicableYear),
    };
  }

  return {
    value: CPF_BASIC_HEALTHCARE_SUM["2026"],
    cohortYear,
    metadata: getPolicyMetadata("cpf-basic-healthcare-sum", {
      version: `${year}-freeze-2026`,
      status: "assumed",
      effectiveFrom: `${year}-01-01`,
      effectiveTo: `${year}-12-31`,
      notes: [
        "No later BHS has been published; the 2026 BHS is held constant without extrapolation.",
      ],
    }),
  };
}
