import { calculateCpfContribution } from "@/lib/calculate-cpf-contribution";
import {
  type AllocationRateBand,
  type ContributionAgeBandId,
  type ContributionCitizenship,
  type ContributionInput,
  type ContributionPolicySchedule,
  type ContributionRateBand,
  ContributionPolicyError,
  getContributionRatesForCitizenship,
  resolveContributionSchedule,
} from "@/policy";

export interface PolicyAgeGroup {
  id: AllocationRateBand["id"];
  description: string;
  minAgeExclusive?: number;
  maxAgeInclusive?: number;
  retirementAccount: "SA" | "RA";
  contributionRate: {
    employee: number;
    employer: number;
  };
  allocationRate: {
    OA: number;
    SA?: number;
    RA?: number;
    MA: number;
  };
}

export function getPolicyAgeGroups(
  contributionMonth: string,
  citizenship: ContributionCitizenship,
): {
  contributionMonth: string;
  citizenship: ContributionCitizenship;
  schedule: {
    id: string;
    effectiveFrom: string;
    effectiveTo: string;
  };
  ageGroups: PolicyAgeGroup[];
  policy: {
    contribution: ContributionPolicySchedule["contributionMetadata"];
    allocation: ContributionPolicySchedule["allocationMetadata"];
  };
} {
  const resolved = resolveContributionSchedule(contributionMonth);
  const rates = getContributionRatesForCitizenship(
    resolved.schedule,
    citizenship,
  );

  return {
    contributionMonth: contributionMonth.slice(0, 7),
    citizenship,
    schedule: {
      id: resolved.schedule.id,
      effectiveFrom: resolved.schedule.effectiveFrom,
      effectiveTo: resolved.schedule.effectiveTo,
    },
    ageGroups: resolved.schedule.allocationRates.map((allocationBand) => {
      const representativeAge =
        allocationBand.maxAgeInclusive ??
        (allocationBand.minAgeExclusive ?? 0) + 1;
      const contributionBand = findContributionBand(rates, representativeAge);
      return toPolicyAgeGroup(
        allocationBand,
        contributionBand,
        resolved.schedule,
      );
    }),
    policy: {
      contribution: resolved.schedule.contributionMetadata,
      allocation: resolved.schedule.allocationMetadata,
    },
  };
}

export function findPolicyAgeGroup(
  input: ContributionInput,
): ReturnType<typeof getPolicyAgeGroups> & {
  ageGroup: PolicyAgeGroup;
  completedAge: number;
} {
  const result = calculateCpfContribution(input);
  const envelope = getPolicyAgeGroups(
    input.contributionMonth,
    input.citizenship,
  );
  const allocationBand = envelope.ageGroups.find(
    (group) => group.id === result.age.allocationBand,
  );
  const schedule = resolveContributionSchedule(input.contributionMonth).schedule;
  const sourceAllocationBand = schedule.allocationRates.find(
    (group) => group.id === result.age.allocationBand,
  );
  const contributionBand = getContributionRatesForCitizenship(
    schedule,
    input.citizenship,
  ).find((group) => group.id === result.age.contributionBand);

  if (!allocationBand || !sourceAllocationBand || !contributionBand) {
    throw new ContributionPolicyError(
      "INVALID_INPUT",
      "Unable to resolve the requested CPF age group.",
    );
  }

  return {
    ...envelope,
    completedAge: result.age.completedAge,
    ageGroup: toPolicyAgeGroup(
      sourceAllocationBand,
      contributionBand,
      schedule,
      result.age.completedAge,
    ),
  };
}

function findContributionBand(
  bands: readonly ContributionRateBand[],
  age: number,
): ContributionRateBand {
  const match = bands.find(
    (band) =>
      band.maxAgeInclusive === undefined || age <= band.maxAgeInclusive,
  );
  if (!match) {
    throw new ContributionPolicyError(
      "INVALID_INPUT",
      `No contribution band was found for age ${age}.`,
    );
  }
  return match;
}

function toPolicyAgeGroup(
  allocationBand: AllocationRateBand,
  contributionBand: ContributionRateBand,
  schedule: ContributionPolicySchedule,
  exactAge?: number,
): PolicyAgeGroup {
  const retirementAccount = resolveRetirementAccount(
    allocationBand,
    schedule,
    exactAge,
  );
  const retirementRate = allocationBand.retirementBasisPoints / 10000;

  return {
    id: allocationBand.id,
    description: allocationBand.description,
    ...(allocationBand.minAgeExclusive === undefined
      ? {}
      : { minAgeExclusive: allocationBand.minAgeExclusive }),
    ...(allocationBand.maxAgeInclusive === undefined
      ? {}
      : { maxAgeInclusive: allocationBand.maxAgeInclusive }),
    retirementAccount,
    contributionRate: {
      employee: contributionBand.employeeBasisPoints / 10000,
      employer: contributionBand.employerBasisPoints / 10000,
    },
    allocationRate: {
      OA: allocationBand.oaBasisPoints / 10000,
      ...(retirementAccount === "RA"
        ? { RA: retirementRate }
        : { SA: retirementRate }),
      MA: allocationBand.maBasisPoints / 10000,
    },
  };
}

function resolveRetirementAccount(
  band: AllocationRateBand,
  schedule: ContributionPolicySchedule,
  exactAge?: number,
): "SA" | "RA" {
  if (schedule.effectiveFrom < "2025-01-01") return "SA";
  if (exactAge !== undefined) return exactAge >= 55 ? "RA" : "SA";
  return (band.minAgeExclusive ?? 0) >= 55 ? "RA" : "SA";
}

export function isContributionCitizenship(
  value: string,
): value is ContributionCitizenship {
  return (
    value === "citizen" ||
    value === "spr-year1" ||
    value === "spr-year2" ||
    value === "spr-year3-plus"
  );
}

export function parseAgeInput(
  contributionMonth: string,
  citizenship: ContributionCitizenship,
  age: string | null,
  birthMonth: string | null,
): ContributionInput {
  if ((age === null) === (birthMonth === null)) {
    throw new ContributionPolicyError(
      "INVALID_INPUT",
      "Supply exactly one of age or birthMonth.",
    );
  }

  const base = {
    contributionMonth,
    ordinaryWages: 0,
    citizenship,
  };
  if (birthMonth !== null) return { ...base, birthMonth };

  const parsedAge = Number(age);
  if (!Number.isInteger(parsedAge)) {
    throw new ContributionPolicyError(
      "INVALID_INPUT",
      "age must be a non-negative whole number.",
    );
  }
  return { ...base, age: parsedAge };
}

export function contributionBandIdForAge(
  schedule: ContributionPolicySchedule,
  citizenship: ContributionCitizenship,
  age: number,
): ContributionAgeBandId {
  return findContributionBand(
    getContributionRatesForCitizenship(schedule, citizenship),
    age,
  ).id;
}
