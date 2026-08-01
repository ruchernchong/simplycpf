import { getPolicyMetadata, POLICY_SOURCES } from "./sources";
import type { PolicyMetadata, PolicySource, PolicyStatus } from "./types";

export const CPF_WAGE_RULES = {
  noContributionAtOrBelow: 50,
  employerOnlyAtOrBelow: 500,
  phasedEmployeeShareAtOrBelow: 750,
  fullRatesAbove: 750,
  annualAdditionalWageCeiling: 102000,
} as const;

export type ContributionCitizenship =
  | "citizen"
  | "spr-year1"
  | "spr-year2"
  | "spr-year3-plus";

export type ContributionWageBand =
  | "no-contribution"
  | "employer-only"
  | "phased-employee-share"
  | "full-rates";

export type ContributionAgeBandId =
  | "55-and-below"
  | "above-55-to-60"
  | "above-60-to-65"
  | "above-65-to-70"
  | "above-70";

export type AllocationAgeBandId =
  | "35-and-below"
  | "above-35-to-45"
  | "above-45-to-50"
  | "above-50-to-55"
  | "above-55-to-60"
  | "above-60-to-65"
  | "above-65-to-70"
  | "above-70";

export interface ContributionRateBand {
  id: ContributionAgeBandId;
  description: string;
  minAgeExclusive?: number;
  maxAgeInclusive?: number;
  employeeBasisPoints: number;
  employerBasisPoints: number;
}

export interface AllocationRateBand {
  id: AllocationAgeBandId;
  description: string;
  minAgeExclusive?: number;
  maxAgeInclusive?: number;
  oaBasisPoints: number;
  retirementBasisPoints: number;
  maBasisPoints: number;
}

export interface ContributionPolicySchedule {
  id: string;
  effectiveFrom: string;
  effectiveTo: string;
  ordinaryWageCeiling: number;
  additionalWageCeiling: number;
  citizenRates: readonly ContributionRateBand[];
  sprYear1Rates: readonly ContributionRateBand[];
  sprYear2Rates: readonly ContributionRateBand[];
  allocationRates: readonly AllocationRateBand[];
  contributionMetadata: PolicyMetadata;
  allocationMetadata: PolicyMetadata;
  wageCeilingMetadata: PolicyMetadata;
}

export interface AdditionalWageCeilingContext {
  /** Total Ordinary Wages subject to CPF for the whole calendar year. */
  annualOrdinaryWagesSubjectToCpf: number;
  /** Additional Wages already made subject to CPF earlier in the year. */
  priorAdditionalWagesSubjectToCpf: number;
}

interface ContributionInputBase {
  contributionMonth: string;
  ordinaryWages: number;
  additionalWages?: number;
  additionalWageCeilingContext?: AdditionalWageCeilingContext;
  citizenship: ContributionCitizenship;
  hasReachedFullRetirementSum?: boolean;
}

export type ContributionInput = ContributionInputBase &
  ({ age: number; birthMonth?: never } | { age?: never; birthMonth: string });

export interface ContributionWarning {
  code:
    | "additional-wages-capped"
    | "legacy-input"
    | "legacy-rate-override"
    | "routing-context-required"
    | "policy-frozen";
  message: string;
}

export interface ContributionDistribution {
  OA: number;
  SA?: number;
  RA?: number;
  MA: number;
}

export interface ContributionAllocationBranch {
  OA: number;
  RA: number;
  MA: number;
}

export interface ContributionRouting {
  selected: "RA" | "OA" | "undetermined";
  rule: "RA until FRS, then OA";
  branches: {
    beforeFullRetirementSum: ContributionAllocationBranch;
    afterFullRetirementSum: ContributionAllocationBranch;
  };
}

export interface ContributionCalculationResult {
  contribution: {
    employee: number;
    employer: number;
    totalContribution: number;
  };
  distribution: ContributionDistribution;
  afterCpfContribution: number;
  wageBand: ContributionWageBand;
  subjectWages: {
    ordinaryWages: number;
    additionalWages: number;
    total: number;
  };
  age: {
    completedAge: number;
    contributionBand: ContributionAgeBandId;
    allocationBand: AllocationAgeBandId;
    transitionAppliedFromBirthMonth: boolean;
  };
  schedule: {
    id: string;
    effectiveFrom: string;
    effectiveTo: string;
    citizenship: ContributionCitizenship;
    employeeRate: number;
    employerRate: number;
    ordinaryWageCeiling: number;
    additionalWageCeiling: number;
    status: PolicyStatus;
  };
  routing?: ContributionRouting;
  warnings: readonly ContributionWarning[];
  policy: {
    contribution: PolicyMetadata;
    allocation: PolicyMetadata;
    wageCeiling: PolicyMetadata;
  };
}

const FULL_2023: readonly ContributionRateBand[] = [
  rateBand("55-and-below", "55 and below", 55, 2000, 1700),
  rateBand("above-55-to-60", "Above 55 to 60", 60, 1500, 1450, 55),
  rateBand("above-60-to-65", "Above 60 to 65", 65, 950, 1100, 60),
  rateBand("above-65-to-70", "Above 65 to 70", 70, 700, 850, 65),
  rateBand("above-70", "Above 70", undefined, 500, 750, 70),
];

const FULL_2024: readonly ContributionRateBand[] = [
  rateBand("55-and-below", "55 and below", 55, 2000, 1700),
  rateBand("above-55-to-60", "Above 55 to 60", 60, 1600, 1500, 55),
  rateBand("above-60-to-65", "Above 60 to 65", 65, 1050, 1150, 60),
  rateBand("above-65-to-70", "Above 65 to 70", 70, 750, 900, 65),
  rateBand("above-70", "Above 70", undefined, 500, 750, 70),
];

const FULL_2025: readonly ContributionRateBand[] = [
  rateBand("55-and-below", "55 and below", 55, 2000, 1700),
  rateBand("above-55-to-60", "Above 55 to 60", 60, 1700, 1550, 55),
  rateBand("above-60-to-65", "Above 60 to 65", 65, 1150, 1200, 60),
  rateBand("above-65-to-70", "Above 65 to 70", 70, 750, 900, 65),
  rateBand("above-70", "Above 70", undefined, 500, 750, 70),
];

const FULL_2026: readonly ContributionRateBand[] = [
  rateBand("55-and-below", "55 and below", 55, 2000, 1700),
  rateBand("above-55-to-60", "Above 55 to 60", 60, 1800, 1600, 55),
  rateBand("above-60-to-65", "Above 60 to 65", 65, 1250, 1250, 60),
  rateBand("above-65-to-70", "Above 65 to 70", 70, 750, 900, 65),
  rateBand("above-70", "Above 70", undefined, 500, 750, 70),
];

const FULL_2027: readonly ContributionRateBand[] = [
  rateBand("55-and-below", "55 and below", 55, 2000, 1700),
  rateBand("above-55-to-60", "Above 55 to 60", 60, 1900, 1650, 55),
  rateBand("above-60-to-65", "Above 60 to 65", 65, 1300, 1300, 60),
  rateBand("above-65-to-70", "Above 65 to 70", 70, 750, 900, 65),
  rateBand("above-70", "Above 70", undefined, 500, 750, 70),
];

/** Graduated/Graduated rates have not changed since 1 January 2016. */
export const SPR_YEAR_1_CONTRIBUTION_RATES: readonly ContributionRateBand[] = [
  rateBand("55-and-below", "55 and below", 55, 500, 400),
  rateBand("above-55-to-60", "Above 55 to 60", 60, 500, 400, 55),
  rateBand("above-60-to-65", "Above 60 to 65", 65, 500, 350, 60),
  rateBand("above-65-to-70", "Above 65 to 70", 70, 500, 350, 65),
  rateBand("above-70", "Above 70", undefined, 500, 350, 70),
];

/** Graduated/Graduated rates have not changed since 1 January 2016. */
export const SPR_YEAR_2_CONTRIBUTION_RATES: readonly ContributionRateBand[] = [
  rateBand("55-and-below", "55 and below", 55, 1500, 900),
  rateBand("above-55-to-60", "Above 55 to 60", 60, 1250, 600, 55),
  rateBand("above-60-to-65", "Above 60 to 65", 65, 750, 350, 60),
  rateBand("above-65-to-70", "Above 65 to 70", 70, 500, 350, 65),
  rateBand("above-70", "Above 70", undefined, 500, 350, 70),
];

const ALLOCATION_2023 = allocationRates(
  [4069, 2372, 3559],
  [1709, 3170, 5121],
  [646, 2580, 6774],
);

const ALLOCATION_2024 = allocationRates(
  [3872, 2741, 3387],
  [1592, 3636, 4772],
  [607, 3030, 6363],
);

const ALLOCATION_2025 = allocationRates(
  [3694, 3076, 3230],
  [1490, 4042, 4468],
  [607, 3030, 6363],
);

const ALLOCATION_2026 = allocationRates(
  [3530, 3382, 3088],
  [1400, 4400, 4200],
  [607, 3030, 6363],
);

const ALLOCATION_2027 = allocationRates(
  [3382, 3661, 2957],
  [1347, 4615, 4038],
  [607, 3030, 6363],
);

export const CPF_CONTRIBUTION_SCHEDULES: readonly ContributionPolicySchedule[] =
  [
    schedule(
      "cpf-2023-jan-aug",
      "2023-01-01",
      "2023-08-31",
      6000,
      FULL_2023,
      ALLOCATION_2023,
    ),
    schedule(
      "cpf-2023-sep-dec",
      "2023-09-01",
      "2023-12-31",
      6300,
      FULL_2023,
      ALLOCATION_2023,
    ),
    schedule(
      "cpf-2024",
      "2024-01-01",
      "2024-12-31",
      6800,
      FULL_2024,
      ALLOCATION_2024,
    ),
    schedule(
      "cpf-2025",
      "2025-01-01",
      "2025-12-31",
      7400,
      FULL_2025,
      ALLOCATION_2025,
    ),
    schedule(
      "cpf-2026",
      "2026-01-01",
      "2026-12-31",
      8000,
      FULL_2026,
      ALLOCATION_2026,
    ),
    schedule(
      "cpf-2027",
      "2027-01-01",
      "2027-12-31",
      8000,
      FULL_2027,
      ALLOCATION_2027,
    ),
  ];

export class ContributionPolicyError extends Error {
  constructor(
    public readonly code:
      | "INVALID_INPUT"
      | "UNSUPPORTED_POLICY_MONTH"
      | "AW_CONTEXT_REQUIRED",
    message: string,
  ) {
    super(message);
    this.name = "ContributionPolicyError";
  }
}

export interface ResolvedContributionSchedule {
  schedule: ContributionPolicySchedule;
  status: PolicyStatus;
  warning?: ContributionWarning;
}

export function resolveContributionSchedule(
  contributionMonth: string,
  mode: "official-only" | "freeze-latest" = "official-only",
): ResolvedContributionSchedule {
  const month = normaliseMonth(contributionMonth);
  const official = CPF_CONTRIBUTION_SCHEDULES.find(
    (candidate) =>
      month >= candidate.effectiveFrom.slice(0, 7) &&
      month <= candidate.effectiveTo.slice(0, 7),
  );

  if (official) return { schedule: official, status: "official" };

  const first = CPF_CONTRIBUTION_SCHEDULES[0];
  const latest = CPF_CONTRIBUTION_SCHEDULES.at(-1);
  if (!first || !latest || month < first.effectiveFrom.slice(0, 7)) {
    throw new ContributionPolicyError(
      "UNSUPPORTED_POLICY_MONTH",
      `No sourced CPF contribution policy is available for ${month}.`,
    );
  }

  if (mode === "freeze-latest" && month > latest.effectiveTo.slice(0, 7)) {
    return {
      schedule: latest,
      status: "assumed",
      warning: {
        code: "policy-frozen",
        message: `CPF rules published through ${latest.effectiveTo.slice(0, 7)} were held constant for ${month}.`,
      },
    };
  }

  throw new ContributionPolicyError(
    "UNSUPPORTED_POLICY_MONTH",
    `No sourced CPF contribution policy is available for ${month}.`,
  );
}

export function getOfficialOrdinaryWageCeiling(
  contributionMonth: string,
): number {
  return resolveContributionSchedule(contributionMonth).schedule
    .ordinaryWageCeiling;
}

export function getContributionRatesForCitizenship(
  scheduleValue: ContributionPolicySchedule,
  citizenship: ContributionCitizenship,
): readonly ContributionRateBand[] {
  if (citizenship === "spr-year1") return scheduleValue.sprYear1Rates;
  if (citizenship === "spr-year2") return scheduleValue.sprYear2Rates;
  return scheduleValue.citizenRates;
}

export function normaliseContributionMonth(value: string): string {
  return normaliseMonth(value);
}

function rateBand(
  id: ContributionAgeBandId,
  description: string,
  maxAgeInclusive: number | undefined,
  employeeBasisPoints: number,
  employerBasisPoints: number,
  minAgeExclusive?: number,
): ContributionRateBand {
  return {
    id,
    description,
    ...(minAgeExclusive === undefined ? {} : { minAgeExclusive }),
    ...(maxAgeInclusive === undefined ? {} : { maxAgeInclusive }),
    employeeBasisPoints,
    employerBasisPoints,
  };
}

function allocationRates(
  above55: readonly [number, number, number],
  above60: readonly [number, number, number],
  above65: readonly [number, number, number],
): readonly AllocationRateBand[] {
  return [
    allocationBand("35-and-below", "35 and below", 35, 6217, 1621, 2162),
    allocationBand(
      "above-35-to-45",
      "Above 35 to 45",
      45,
      5677,
      1891,
      2432,
      35,
    ),
    allocationBand(
      "above-45-to-50",
      "Above 45 to 50",
      50,
      5136,
      2162,
      2702,
      45,
    ),
    allocationBand(
      "above-50-to-55",
      "Above 50 to 55",
      55,
      4055,
      3108,
      2837,
      50,
    ),
    allocationBand(
      "above-55-to-60",
      "Above 55 to 60",
      60,
      above55[0],
      above55[1],
      above55[2],
      55,
    ),
    allocationBand(
      "above-60-to-65",
      "Above 60 to 65",
      65,
      above60[0],
      above60[1],
      above60[2],
      60,
    ),
    allocationBand(
      "above-65-to-70",
      "Above 65 to 70",
      70,
      above65[0],
      above65[1],
      above65[2],
      65,
    ),
    allocationBand("above-70", "Above 70", undefined, 800, 800, 8400, 70),
  ];
}

function allocationBand(
  id: AllocationAgeBandId,
  description: string,
  maxAgeInclusive: number | undefined,
  oaBasisPoints: number,
  retirementBasisPoints: number,
  maBasisPoints: number,
  minAgeExclusive?: number,
): AllocationRateBand {
  return {
    id,
    description,
    ...(minAgeExclusive === undefined ? {} : { minAgeExclusive }),
    ...(maxAgeInclusive === undefined ? {} : { maxAgeInclusive }),
    oaBasisPoints,
    retirementBasisPoints,
    maBasisPoints,
  };
}

function schedule(
  id: string,
  effectiveFrom: string,
  effectiveTo: string,
  ordinaryWageCeiling: number,
  citizenRates: readonly ContributionRateBand[],
  allocationRatesValue: readonly AllocationRateBand[],
): ContributionPolicySchedule {
  const year = effectiveFrom.slice(0, 4);
  const version = id;
  const sources = getScheduleSources(id);
  return {
    id,
    effectiveFrom,
    effectiveTo,
    ordinaryWageCeiling,
    additionalWageCeiling: CPF_WAGE_RULES.annualAdditionalWageCeiling,
    citizenRates,
    sprYear1Rates: SPR_YEAR_1_CONTRIBUTION_RATES,
    sprYear2Rates: SPR_YEAR_2_CONTRIBUTION_RATES,
    allocationRates: allocationRatesValue,
    contributionMetadata: getPolicyMetadata("cpf-contribution-rates", {
      version,
      effectiveFrom,
      effectiveTo,
      notes: [
        `Official schedule for ${year}; G/G SPR rates have been unchanged since 1 January 2016.`,
      ],
      sources: [sources.contribution, POLICY_SOURCES.ageGroupTransition],
    }),
    allocationMetadata: getPolicyMetadata("cpf-allocation-rates", {
      version,
      effectiveFrom,
      effectiveTo,
      sources: [
        sources.allocation,
        POLICY_SOURCES.allocationTransition,
        ...(effectiveFrom >= "2025-01-01"
          ? [POLICY_SOURCES.specialAccountClosure]
          : []),
      ],
    }),
    wageCeilingMetadata: getPolicyMetadata("cpf-wage-ceilings", {
      version,
      effectiveFrom,
      effectiveTo,
      sources: [sources.contribution, POLICY_SOURCES.ordinaryWageCeiling],
    }),
  };
}

function getScheduleSources(id: string): {
  contribution: PolicySource;
  allocation: PolicySource;
} {
  if (id === "cpf-2023-jan-aug") {
    return {
      contribution: POLICY_SOURCES.contributionRates2023Jan,
      allocation: POLICY_SOURCES.contributionRates2023Jan,
    };
  }
  if (id === "cpf-2023-sep-dec") {
    return {
      contribution: POLICY_SOURCES.contributionRates2023Sep,
      allocation: POLICY_SOURCES.contributionRates2023Sep,
    };
  }
  if (id === "cpf-2024") {
    return {
      contribution: POLICY_SOURCES.contributionRates2024,
      allocation: POLICY_SOURCES.contributionRates2024,
    };
  }
  if (id === "cpf-2025") {
    return {
      contribution: POLICY_SOURCES.contributionRates2025,
      allocation: POLICY_SOURCES.contributionRates2025,
    };
  }
  if (id === "cpf-2026") {
    return {
      contribution: POLICY_SOURCES.contributionRates2026,
      allocation: POLICY_SOURCES.allocationRates2026,
    };
  }
  if (id === "cpf-2027") {
    return {
      contribution: POLICY_SOURCES.contributionRates2027,
      allocation: POLICY_SOURCES.allocationRates2027,
    };
  }
  throw new Error(`Unknown CPF contribution schedule: ${id}.`);
}

function normaliseMonth(value: string): string {
  const match = /^(\d{4})-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?$/.exec(
    value,
  );
  if (!match) {
    throw new ContributionPolicyError(
      "INVALID_INPUT",
      "contributionMonth must be in YYYY-MM or YYYY-MM-DD format.",
    );
  }
  return `${match[1]}-${match[2]}`;
}
