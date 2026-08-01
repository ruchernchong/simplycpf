import type { PolicyMetadata } from "@/policy";
import {
  CPF_COHORT_FULL_RETIREMENT_SUM_ROWS,
  CPF_RETIREMENT_SUM_ROWS,
  findCohortFullRetirementSum,
  getPolicyMetadata,
  POLICY_METADATA,
  POLICY_SOURCES,
} from "@/policy";

export const CPF_RETIREMENT_SUMS_SOURCE_URL = POLICY_SOURCES.retirementSums.url;

export const CPF_RETIREMENT_SUMS_VERIFIED_AT =
  POLICY_METADATA["cpf-retirement-sums"].verifiedAt;

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

/** Compatibility map derived from the canonical published policy rows. */
export const CPF_RETIREMENT_SUMS = CPF_RETIREMENT_SUM_ROWS.reduce<
  Record<string, RetirementSums>
>((sums, row) => {
  sums[String(row.year)] = { brs: row.brs, frs: row.frs, ers: row.ers };
  return sums;
}, {});

const earliestCohortRow = CPF_COHORT_FULL_RETIREMENT_SUM_ROWS[0];
const latestCohortRow =
  CPF_COHORT_FULL_RETIREMENT_SUM_ROWS[
    CPF_COHORT_FULL_RETIREMENT_SUM_ROWS.length - 1
  ];
const earliestRetirementSumRow = CPF_RETIREMENT_SUM_ROWS[0];
const latestRetirementSumRow =
  CPF_RETIREMENT_SUM_ROWS[CPF_RETIREMENT_SUM_ROWS.length - 1];

if (
  !earliestCohortRow ||
  !latestCohortRow ||
  !earliestRetirementSumRow ||
  !latestRetirementSumRow
) {
  throw new Error("The canonical retirement-sum policy catalogue is empty.");
}

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

/** Holds the latest published sums constant for future projection years. */
export function getRetirementSumsForProjection(
  year: number,
): RetirementSumsPolicyValue {
  const official = CPF_RETIREMENT_SUMS[String(year)];
  if (official !== undefined) {
    return { value: official, metadata: officialMetadata(year) };
  }

  if (year < earliestRetirementSumRow.year) {
    throw new RangeError(
      `Projection retirement sums before ${earliestRetirementSumRow.year} are outside the supported policy catalogue (${year}).`,
    );
  }

  return {
    value: {
      brs: latestRetirementSumRow.brs,
      frs: latestRetirementSumRow.frs,
      ers: latestRetirementSumRow.ers,
    },
    metadata: getPolicyMetadata("cpf-retirement-sums", {
      version: `${year}-freeze-${latestRetirementSumRow.year}`,
      status: "assumed",
      effectiveFrom: `${year}-01-01`,
      effectiveTo: `${year}-12-31`,
      notes: [
        `No later retirement sums have been published; the ${latestRetirementSumRow.year} sums are held constant without extrapolation.`,
      ],
    }),
  };
}

function normaliseFiftyFifthBirthday(value: number | string): string {
  if (typeof value === "number") {
    if (!Number.isInteger(value)) {
      throw new RangeError("The 55th-birthday year must be a whole number.");
    }
    return `${value}-01-01`;
  }

  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return `${value}-01`;
  if (/^\d{4}-(0[1-9]|1[0-2])-([012]\d|3[01])$/.test(value)) {
    return value;
  }
  throw new RangeError("The 55th birthday must use YYYY-MM or YYYY-MM-DD.");
}

/** Resolves the exact BRS/FRS fixed on the member's 55th birthday. */
export function getCohortRetirementThresholds(
  fiftyFifthBirthday: number | string,
): CohortRetirementThresholds {
  const birthday = normaliseFiftyFifthBirthday(fiftyFifthBirthday);
  const official = findCohortFullRetirementSum(birthday);
  if (official) {
    return {
      brs: official.fullRetirementSum / 2,
      frs: official.fullRetirementSum,
      metadata: getPolicyMetadata("cpf-retirement-sums", {
        version: `cohort-${official.effectiveFrom}-${official.effectiveTo}`,
        effectiveFrom: official.effectiveFrom,
        effectiveTo: official.effectiveTo,
      }),
    };
  }

  if (birthday < earliestCohortRow.effectiveFrom) {
    throw new RangeError(
      `No sourced cohort retirement sum is available for ${birthday}.`,
    );
  }

  const projectionYear = birthday.slice(0, 4);
  return {
    brs: latestCohortRow.fullRetirementSum / 2,
    frs: latestCohortRow.fullRetirementSum,
    metadata: getPolicyMetadata("cpf-retirement-sums", {
      version: `${projectionYear}-freeze-${latestCohortRow.effectiveTo.slice(0, 4)}`,
      status: "assumed",
      effectiveFrom: `${projectionYear}-01-01`,
      effectiveTo: `${projectionYear}-12-31`,
      notes: [
        `No later cohort FRS has been published; the BRS and FRS effective through ${latestCohortRow.effectiveTo} are held constant without extrapolation.`,
      ],
    }),
  };
}
