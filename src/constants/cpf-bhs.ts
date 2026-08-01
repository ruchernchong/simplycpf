import type { PolicyMetadata } from "@/policy";
import {
  CPF_BASIC_HEALTHCARE_SUM_ROWS,
  CPF_POLICY_RULES,
  getPolicyMetadata,
  POLICY_METADATA,
  POLICY_SOURCES,
} from "@/policy";

export const CPF_BHS_SOURCE_URL = POLICY_SOURCES.basicHealthcareSum.url;

export const CPF_BHS_VERIFIED_AT =
  POLICY_METADATA["cpf-basic-healthcare-sum"].verifiedAt;

/** Compatibility map derived from the canonical published BHS policy rows. */
export const CPF_BASIC_HEALTHCARE_SUM = CPF_BASIC_HEALTHCARE_SUM_ROWS.reduce<
  Record<string, number>
>((amounts, row) => {
  amounts[String(row.year)] = row.amount;
  return amounts;
}, {});

const earliestPublishedBhs = CPF_BASIC_HEALTHCARE_SUM_ROWS[0];
const latestPublishedBhs =
  CPF_BASIC_HEALTHCARE_SUM_ROWS[CPF_BASIC_HEALTHCARE_SUM_ROWS.length - 1];

if (!earliestPublishedBhs || !latestPublishedBhs) {
  throw new Error("The canonical BHS policy catalogue is empty.");
}

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
 * Resolves the BHS for a projection. A member's BHS freezes at the catalogue's
 * official cohort age. For an unpublished future year, the last published
 * amount is held constant and explicitly marked as an assumption.
 */
export function getBhsForProjection(
  year: number,
  memberBirthYear: number,
): BhsPolicyValue {
  const cohortYear =
    memberBirthYear + CPF_POLICY_RULES.lifecycleAges.basicHealthcareSumFrozen;
  const applicableYear = Math.min(year, cohortYear);

  if (applicableYear <= earliestPublishedBhs.year) {
    return {
      value: earliestPublishedBhs.amount,
      cohortYear,
      metadata: {
        ...officialMetadata(earliestPublishedBhs.year),
        notes: [
          `CPF Board publishes S$${earliestPublishedBhs.amount.toLocaleString("en-SG")} for members born in ${earliestPublishedBhs.cohortBirthYearAtOrBefore} or earlier.`,
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
    value: latestPublishedBhs.amount,
    cohortYear,
    metadata: getPolicyMetadata("cpf-basic-healthcare-sum", {
      version: `${year}-freeze-${latestPublishedBhs.year}`,
      status: "assumed",
      effectiveFrom: `${year}-01-01`,
      effectiveTo: `${year}-12-31`,
      notes: [
        `No later BHS has been published; the ${latestPublishedBhs.year} BHS is held constant without extrapolation.`,
      ],
    }),
  };
}
