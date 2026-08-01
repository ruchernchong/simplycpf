import {
  type AllocationRateBand,
  type ContributionCitizenship,
  type ContributionRateBand,
  CPF_POLICY_CATALOGUE,
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
    const retirementAge =
      CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;
    const retirementAccount =
      contributionMonth >=
        CPF_POLICY_CATALOGUE.rules.specialAccountClosure.effectiveDate.slice(
          0,
          7,
        ) && (allocation.minAgeExclusive ?? 0) >= retirementAge
        ? "RA"
        : "SA";

    return {
      description: allocation.description,
      ...(allocation.minAgeExclusive === undefined
        ? {}
        : { minAgeExclusive: allocation.minAgeExclusive }),
      ...(allocation.maxAgeInclusive === undefined
        ? {}
        : { maxAgeInclusive: allocation.maxAgeInclusive }),
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

/** Rates current on the contribution dataset's verification date. */
export const ageGroups: AgeGroup[] = getAgeGroupsForMonth(
  CPF_POLICY_CATALOGUE.metadata["cpf-contribution-rates"].verifiedAt,
  "citizen",
);

function findContributionBand(
  contributionRates: readonly ContributionRateBand[],
  allocation: AllocationRateBand,
): ContributionRateBand {
  const contributionAgeBand =
    allocation.maxAgeInclusive !== undefined &&
    allocation.maxAgeInclusive <=
      CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated
      ? contributionRates.find(
          (candidate) =>
            candidate.maxAgeInclusive ===
            CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated,
        )?.id
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
