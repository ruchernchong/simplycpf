import type { PolicyMetadata } from "@/policy";
import {
  type AllocationRateBand,
  type ContributionCalculationResult,
  type ContributionCitizenship,
  type ContributionDistribution,
  type ContributionInput,
  ContributionPolicyError,
  type ContributionPolicySchedule,
  type ContributionRateBand,
  type ContributionRouting,
  type ContributionWarning,
  CPF_WAGE_RULES,
  getContributionRatesForCitizenship,
  normaliseContributionMonth,
  type ResolvedContributionSchedule,
  resolveContributionSchedule,
} from "@/policy";
import type { AgeGroup, IncomeOptions } from "@/types";

const CENTS_PER_DOLLAR = 100;
const RATE_DENOMINATOR = 10000;
const DOLLAR_ROUNDING_DENOMINATOR = CENTS_PER_DOLLAR * RATE_DENOMINATOR;
const LOW_WAGE_LIMIT_CENTS =
  CPF_WAGE_RULES.noContributionAtOrBelow * CENTS_PER_DOLLAR;
const EMPLOYER_ONLY_LIMIT_CENTS =
  CPF_WAGE_RULES.employerOnlyAtOrBelow * CENTS_PER_DOLLAR;
const PHASED_RATE_LIMIT_CENTS =
  CPF_WAGE_RULES.phasedEmployeeShareAtOrBelow * CENTS_PER_DOLLAR;

interface NormalisedAge {
  completedAge: number;
  monthsSinceBirth?: number;
  transitionAppliedFromBirthMonth: boolean;
}

interface LegacyOverrides {
  ordinaryWageCeiling?: number;
}

interface CalculationOptions {
  policyMode: "official-only" | "freeze-latest";
  warnings: ContributionWarning[];
  legacyOverrides?: LegacyOverrides;
}

interface ContributionAmountsCents {
  employee: number;
  employer: number;
  total: number;
  wageBand: ContributionCalculationResult["wageBand"];
}

interface AllocationResult {
  distribution: ContributionDistribution;
  routing?: ContributionRouting;
}

export function calculateCpfContribution(
  input: ContributionInput,
): ContributionCalculationResult;
export function calculateCpfContribution(
  income: number,
  year: number | string,
  options?: IncomeOptions,
): ContributionCalculationResult;
export function calculateCpfContribution(
  inputOrIncome: ContributionInput | number,
  year?: number | string,
  options?: IncomeOptions,
): ContributionCalculationResult {
  if (typeof inputOrIncome === "number") {
    const legacy = normaliseLegacyInput(inputOrIncome, year, options);
    return calculateContribution(legacy.input, {
      policyMode: "official-only",
      warnings: legacy.warnings,
      ...(legacy.overrides ? { legacyOverrides: legacy.overrides } : {}),
    });
  }

  return calculateContribution(inputOrIncome, {
    policyMode: "official-only",
    warnings: [],
  });
}

/**
 * Projection-only entry point. Published rules after 2027 are deliberately
 * frozen and marked assumed instead of silently extrapolated.
 */
export function calculateCpfContributionForProjection(
  input: ContributionInput,
): ContributionCalculationResult {
  return calculateContribution(input, {
    policyMode: "freeze-latest",
    warnings: [],
  });
}

function calculateContribution(
  input: ContributionInput,
  options: CalculationOptions,
): ContributionCalculationResult {
  validateInput(input);

  const contributionMonth = normaliseContributionMonth(input.contributionMonth);
  const resolvedSchedule = resolveContributionSchedule(
    contributionMonth,
    options.policyMode,
  );
  const warnings = [...options.warnings];
  if (resolvedSchedule.warning) warnings.push(resolvedSchedule.warning);

  const age = resolveAge(input, contributionMonth);
  const contributionRates = getContributionRatesForCitizenship(
    resolvedSchedule.schedule,
    input.citizenship,
  );
  const contributionBand = findBand(contributionRates, age);
  const allocationBand = findBand(
    resolvedSchedule.schedule.allocationRates,
    age,
  );

  const ordinaryWagesCents = toCents(input.ordinaryWages);
  const additionalWagesCents = toCents(input.additionalWages ?? 0);
  const ordinaryWageCeiling =
    options.legacyOverrides?.ordinaryWageCeiling ??
    resolvedSchedule.schedule.ordinaryWageCeiling;
  const subjectOrdinaryWagesCents = Math.min(
    ordinaryWagesCents,
    toCents(ordinaryWageCeiling),
  );
  const subjectAdditionalWagesCents = resolveSubjectAdditionalWages(
    additionalWagesCents,
    input,
    resolvedSchedule.schedule,
    warnings,
  );
  const subjectTotalWagesCents =
    subjectOrdinaryWagesCents + subjectAdditionalWagesCents;

  const contribution = calculateContributionAmounts(
    subjectTotalWagesCents,
    contributionBand,
  );
  const allocation = calculateAllocation(
    contribution.total,
    allocationBand,
    age.completedAge,
    contributionMonth,
    input.hasReachedFullRetirementSum,
    warnings,
  );

  const grossWagesCents = ordinaryWagesCents + additionalWagesCents;
  const policy = buildPolicyMetadata(resolvedSchedule, contributionMonth);

  return {
    contribution: {
      employee: fromCents(contribution.employee),
      employer: fromCents(contribution.employer),
      totalContribution: fromCents(contribution.total),
    },
    distribution: allocation.distribution,
    afterCpfContribution: fromCents(grossWagesCents - contribution.employee),
    wageBand: contribution.wageBand,
    subjectWages: {
      ordinaryWages: fromCents(subjectOrdinaryWagesCents),
      additionalWages: fromCents(subjectAdditionalWagesCents),
      total: fromCents(subjectTotalWagesCents),
    },
    age: {
      completedAge: age.completedAge,
      contributionBand: contributionBand.id,
      allocationBand: allocationBand.id,
      transitionAppliedFromBirthMonth: age.transitionAppliedFromBirthMonth,
    },
    schedule: {
      id: resolvedSchedule.schedule.id,
      effectiveFrom: resolvedSchedule.schedule.effectiveFrom,
      effectiveTo: resolvedSchedule.schedule.effectiveTo,
      citizenship: input.citizenship,
      employeeRate: contributionBand.employeeBasisPoints / 10000,
      employerRate: contributionBand.employerBasisPoints / 10000,
      ordinaryWageCeiling,
      additionalWageCeiling: resolvedSchedule.schedule.additionalWageCeiling,
      status: resolvedSchedule.status,
    },
    ...(allocation.routing ? { routing: allocation.routing } : {}),
    warnings,
    policy,
  };
}

function validateInput(input: ContributionInput): void {
  validateMoney(input.ordinaryWages, "ordinaryWages");
  validateMoney(input.additionalWages ?? 0, "additionalWages");

  if ("age" in input && input.age !== undefined) {
    if (!Number.isInteger(input.age) || input.age < 0 || input.age > 150) {
      throw new ContributionPolicyError(
        "INVALID_INPUT",
        "age must be a completed age from 0 to 150.",
      );
    }
  }

  if ((input.additionalWages ?? 0) > 0) {
    if (!input.additionalWageCeilingContext) {
      throw new ContributionPolicyError(
        "AW_CONTEXT_REQUIRED",
        "additionalWageCeilingContext is required when additionalWages is supplied.",
      );
    }
    validateMoney(
      input.additionalWageCeilingContext.annualOrdinaryWagesSubjectToCpf,
      "annualOrdinaryWagesSubjectToCpf",
    );
    validateMoney(
      input.additionalWageCeilingContext.priorAdditionalWagesSubjectToCpf,
      "priorAdditionalWagesSubjectToCpf",
    );
  }
}

function validateMoney(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new ContributionPolicyError(
      "INVALID_INPUT",
      `${field} must be a non-negative finite number.`,
    );
  }
}

function resolveAge(
  input: ContributionInput,
  contributionMonth: string,
): NormalisedAge {
  if ("age" in input && input.age !== undefined) {
    return {
      completedAge: input.age,
      transitionAppliedFromBirthMonth: false,
    };
  }

  const birthMonth = normaliseContributionMonth(input.birthMonth);
  const contributionParts = contributionMonth.split("-").map(Number);
  const birthParts = birthMonth.split("-").map(Number);
  const contributionYear = contributionParts[0];
  const contributionMonthNumber = contributionParts[1];
  const birthYear = birthParts[0];
  const birthMonthNumber = birthParts[1];

  if (
    contributionYear === undefined ||
    contributionMonthNumber === undefined ||
    birthYear === undefined ||
    birthMonthNumber === undefined
  ) {
    throw new ContributionPolicyError(
      "INVALID_INPUT",
      "Unable to resolve contributionMonth or birthMonth.",
    );
  }

  const monthsSinceBirth =
    (contributionYear - birthYear) * 12 +
    contributionMonthNumber -
    birthMonthNumber;
  if (monthsSinceBirth < 0) {
    throw new ContributionPolicyError(
      "INVALID_INPUT",
      "birthMonth cannot be after contributionMonth.",
    );
  }

  return {
    completedAge: Math.floor(monthsSinceBirth / 12),
    monthsSinceBirth,
    transitionAppliedFromBirthMonth: true,
  };
}

function findBand<T extends ContributionRateBand | AllocationRateBand>(
  bands: readonly T[],
  age: NormalisedAge,
): T {
  const match = bands.find((band) => {
    if (band.maxAgeInclusive === undefined) return true;
    if (age.monthsSinceBirth !== undefined) {
      return age.monthsSinceBirth <= band.maxAgeInclusive * 12;
    }
    return age.completedAge <= band.maxAgeInclusive;
  });

  if (!match) {
    throw new ContributionPolicyError(
      "INVALID_INPUT",
      `No CPF age band was found for age ${age.completedAge}.`,
    );
  }
  return match;
}

function resolveSubjectAdditionalWages(
  additionalWagesCents: number,
  input: ContributionInput,
  schedule: ContributionPolicySchedule,
  warnings: ContributionWarning[],
): number {
  if (additionalWagesCents === 0) return 0;

  const context = input.additionalWageCeilingContext;
  if (!context) {
    throw new ContributionPolicyError(
      "AW_CONTEXT_REQUIRED",
      "additionalWageCeilingContext is required when additionalWages is supplied.",
    );
  }

  const remainingCeilingCents = Math.max(
    0,
    toCents(schedule.additionalWageCeiling) -
      toCents(context.annualOrdinaryWagesSubjectToCpf) -
      toCents(context.priorAdditionalWagesSubjectToCpf),
  );
  const subjectAdditionalWagesCents = Math.min(
    additionalWagesCents,
    remainingCeilingCents,
  );

  if (subjectAdditionalWagesCents < additionalWagesCents) {
    warnings.push({
      code: "additional-wages-capped",
      message: `Additional Wages subject to CPF were capped at ${fromCents(subjectAdditionalWagesCents)} by the annual Additional Wage ceiling.`,
    });
  }
  return subjectAdditionalWagesCents;
}

function calculateContributionAmounts(
  subjectWagesCents: number,
  rates: ContributionRateBand,
): ContributionAmountsCents {
  if (subjectWagesCents <= LOW_WAGE_LIMIT_CENTS) {
    return {
      employee: 0,
      employer: 0,
      total: 0,
      wageBand: "no-contribution",
    };
  }

  let totalRateNumerator: number;
  let employeeRateNumerator: number;
  let wageBand: ContributionCalculationResult["wageBand"];

  if (subjectWagesCents <= EMPLOYER_ONLY_LIMIT_CENTS) {
    totalRateNumerator = subjectWagesCents * rates.employerBasisPoints;
    employeeRateNumerator = 0;
    wageBand = "employer-only";
  } else if (subjectWagesCents <= PHASED_RATE_LIMIT_CENTS) {
    const phasedWagesCents = subjectWagesCents - EMPLOYER_ONLY_LIMIT_CENTS;
    employeeRateNumerator = phasedWagesCents * rates.employeeBasisPoints * 3;
    totalRateNumerator =
      subjectWagesCents * rates.employerBasisPoints + employeeRateNumerator;
    wageBand = "phased-employee-share";
  } else {
    employeeRateNumerator = subjectWagesCents * rates.employeeBasisPoints;
    totalRateNumerator =
      subjectWagesCents *
      (rates.employeeBasisPoints + rates.employerBasisPoints);
    wageBand = "full-rates";
  }

  const totalDollars = Math.floor(
    (totalRateNumerator + DOLLAR_ROUNDING_DENOMINATOR / 2) /
      DOLLAR_ROUNDING_DENOMINATOR,
  );
  const employeeDollars = Math.floor(
    employeeRateNumerator / DOLLAR_ROUNDING_DENOMINATOR,
  );
  const total = totalDollars * CENTS_PER_DOLLAR;
  const employee = employeeDollars * CENTS_PER_DOLLAR;

  return {
    employee,
    employer: total - employee,
    total,
    wageBand,
  };
}

function calculateAllocation(
  totalContributionCents: number,
  rates: AllocationRateBand,
  completedAge: number,
  contributionMonth: string,
  hasReachedFullRetirementSum: boolean | undefined,
  warnings: ContributionWarning[],
): AllocationResult {
  const ma = roundRatioToCents(totalContributionCents, rates.maBasisPoints);
  const retirement = roundRatioToCents(
    totalContributionCents,
    rates.retirementBasisPoints,
  );
  const oa = totalContributionCents - ma - retirement;
  const usesRetirementAccount =
    contributionMonth >= "2025-01" && completedAge >= 55;

  if (!usesRetirementAccount) {
    return {
      distribution: {
        OA: fromCents(oa),
        SA: fromCents(retirement),
        MA: fromCents(ma),
      },
    };
  }

  const beforeFullRetirementSum = {
    OA: fromCents(oa),
    RA: fromCents(retirement),
    MA: fromCents(ma),
  };
  const afterFullRetirementSum = {
    OA: fromCents(oa + retirement),
    RA: 0,
    MA: fromCents(ma),
  };
  const routing: ContributionRouting = {
    selected:
      hasReachedFullRetirementSum === undefined
        ? "undetermined"
        : hasReachedFullRetirementSum
          ? "OA"
          : "RA",
    rule: "RA until FRS, then OA",
    branches: { beforeFullRetirementSum, afterFullRetirementSum },
  };

  if (hasReachedFullRetirementSum === undefined) {
    warnings.push({
      code: "routing-context-required",
      message:
        "The Retirement Account share goes to RA until the Full Retirement Sum is set aside, then to OA; both official branches are provided because the RA context was not supplied.",
    });
  }

  return {
    distribution:
      hasReachedFullRetirementSum === true
        ? afterFullRetirementSum
        : beforeFullRetirementSum,
    routing,
  };
}

function buildPolicyMetadata(
  resolved: ResolvedContributionSchedule,
  requestedMonth: string,
): ContributionCalculationResult["policy"] {
  return {
    contribution: resolveMetadataStatus(
      resolved.schedule.contributionMetadata,
      resolved,
      requestedMonth,
    ),
    allocation: resolveMetadataStatus(
      resolved.schedule.allocationMetadata,
      resolved,
      requestedMonth,
    ),
    wageCeiling: resolveMetadataStatus(
      resolved.schedule.wageCeilingMetadata,
      resolved,
      requestedMonth,
    ),
  };
}

function resolveMetadataStatus(
  metadata: PolicyMetadata,
  resolved: ResolvedContributionSchedule,
  requestedMonth: string,
): PolicyMetadata {
  if (resolved.status === "official") return metadata;
  return {
    ...metadata,
    version: `${metadata.version}-frozen-for-${requestedMonth}`,
    status: "assumed",
    notes: [
      ...(metadata.notes ?? []),
      `The last published schedule was held constant for ${requestedMonth}; this is a SimplyCPF projection assumption.`,
    ],
  };
}

function normaliseLegacyInput(
  income: number,
  year: number | string | undefined,
  options: IncomeOptions | undefined,
): {
  input: ContributionInput;
  warnings: ContributionWarning[];
  overrides?: LegacyOverrides;
} {
  if (year === undefined) {
    throw new ContributionPolicyError(
      "INVALID_INPUT",
      "A contribution year or month is required.",
    );
  }

  const contributionMonth = normaliseLegacyMonth(year);
  const age = inferLegacyAge(options?.age, options?.ageGroup);
  const citizenship = inferLegacyCitizenship(options?.ageGroup);
  const warnings: ContributionWarning[] = [
    {
      code: "legacy-input",
      message:
        "The income/date calculation signature is deprecated; use contributionMonth, ordinaryWages, citizenship and age or birthMonth.",
    },
  ];

  const overrides = options?.useCeilingBeforeSep2023
    ? { ordinaryWageCeiling: 6000 }
    : undefined;

  return {
    input: {
      contributionMonth,
      ordinaryWages: income,
      citizenship,
      age,
    },
    warnings,
    ...(overrides ? { overrides } : {}),
  };
}

function normaliseLegacyMonth(value: number | string): string {
  if (typeof value === "number" || /^\d{4}$/.test(value)) {
    const numericYear = Number(value);
    if (!Number.isInteger(numericYear)) {
      throw new ContributionPolicyError(
        "INVALID_INPUT",
        "year must be a whole calendar year.",
      );
    }
    return `${numericYear}-01`;
  }
  return normaliseContributionMonth(value);
}

function inferLegacyAge(
  suppliedAge: number | undefined,
  ageGroup: AgeGroup | undefined,
): number {
  if (suppliedAge !== undefined) return suppliedAge;
  if (!ageGroup) return 0;
  if (ageGroup.maxAge !== undefined) return ageGroup.maxAge;
  return ageGroup.minAge + 1;
}

function inferLegacyCitizenship(
  ageGroup: AgeGroup | undefined,
): ContributionCitizenship {
  if (!ageGroup) return "citizen";
  const { employee, employer } = ageGroup.contributionRate;
  if (
    approximatelyEqual(employee, 0.05) &&
    (approximatelyEqual(employer, 0.04) || approximatelyEqual(employer, 0.035))
  ) {
    return "spr-year1";
  }
  if (
    (approximatelyEqual(employee, 0.15) &&
      approximatelyEqual(employer, 0.09)) ||
    (approximatelyEqual(employee, 0.125) &&
      approximatelyEqual(employer, 0.06)) ||
    (approximatelyEqual(employee, 0.075) && approximatelyEqual(employer, 0.035))
  ) {
    return "spr-year2";
  }
  return "citizen";
}

function approximatelyEqual(left: number, right: number): boolean {
  return Math.abs(left - right) < Number.EPSILON * 10;
}

function roundRatioToCents(
  totalContributionCents: number,
  basisPoints: number,
): number {
  return Math.floor(
    (totalContributionCents * basisPoints + RATE_DENOMINATOR / 2) /
      RATE_DENOMINATOR,
  );
}

function toCents(value: number): number {
  return Math.round((value + Number.EPSILON) * CENTS_PER_DOLLAR);
}

function fromCents(value: number): number {
  return value / CENTS_PER_DOLLAR;
}
