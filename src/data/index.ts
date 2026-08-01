import {
  type AllocationRateBand,
  type ContributionCitizenship,
  type ContributionRateBand,
  getContributionRatesForCitizenship,
  resolveContributionSchedule,
} from "@/policy";
import type { AgeGroup } from "@/types";

/**
 * Compatibility adapter for screens that still consume `AgeGroup[]`.
 * The authoritative rates remain in `src/policy/contributions.ts`.
 */
export function getAgeGroupsForMonth(
  contributionMonth: string,
  citizenship: ContributionCitizenship = "citizen",
): AgeGroup[] {
  const schedule = resolveContributionSchedule(contributionMonth).schedule;
  const contributionRates = getContributionRatesForCitizenship(
    schedule,
    citizenship,
  );

  return schedule.allocationRates.map((allocation) => {
    const contribution = findContributionBand(contributionRates, allocation);
    const retirementAccount =
      contributionMonth >= "2025-01" && (allocation.minAgeExclusive ?? 0) >= 55
        ? "RA"
        : "SA";

    return {
      description: allocation.description,
      minAge: allocation.minAgeExclusive ?? 0,
      ...(allocation.maxAgeInclusive === undefined
        ? {}
        : { maxAge: allocation.maxAgeInclusive }),
      contributionRate: {
        employee: contribution.employeeBasisPoints / 10000,
        employer: contribution.employerBasisPoints / 10000,
      },
      distributionRate: {
        OA: allocation.oaBasisPoints / 10000,
        [retirementAccount]: allocation.retirementBasisPoints / 10000,
        MA: allocation.maBasisPoints / 10000,
      },
    };
  });
}

/** Current (2026) rates; retained for existing UI and selector imports. */
export const ageGroups: AgeGroup[] = getAgeGroupsForMonth("2026-01", "citizen");

function findContributionBand(
  contributionRates: readonly ContributionRateBand[],
  allocation: AllocationRateBand,
): ContributionRateBand {
  const contributionAgeBand =
    allocation.maxAgeInclusive !== undefined && allocation.maxAgeInclusive <= 55
      ? "55-and-below"
      : allocation.id;
  const match = contributionRates.find(
    (candidate) => candidate.id === contributionAgeBand,
  );
  if (!match) {
    throw new Error(
      `No contribution rate matches allocation band ${allocation.id}.`,
    );
  }
  return match;
}
