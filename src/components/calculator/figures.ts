import { CPF_INCOME_CEILING } from "@/constants";
import { calculateCpfContribution } from "@/lib/calculate-cpf-contribution";
import { findAgeGroup } from "@/lib/find-age-group";
import { formatCurrency, formatPercentage } from "@/lib/format";
import type {
  ContributionRouting,
  ContributionWageBand,
  ContributionWarning,
} from "@/policy";
import { CPF_POLICY_CATALOGUE } from "@/policy";
import type { AgeGroup, CitizenshipStatus } from "@/types";

/** Figures shown before the visitor has entered anything of their own. */
export const ILLUSTRATIVE_INCOME = 5000;
export const ILLUSTRATIVE_AGE = 32;

export interface CalculatorFigures {
  /** True when the numbers come from the illustrative defaults, not the visitor. */
  isIllustrative: boolean;
  age: number;
  birthMonth?: string;
  citizenship: CitizenshipStatus;
  contributionMonth: string;
  scheduleEffectiveFrom: string;
  ageGroup: AgeGroup;
  ceilingDate: string;
  ceiling: number;
  gross: number;
  /** The part of the salary CPF is charged on. */
  contributable: number;
  employee: number;
  employer: number;
  total: number;
  takeHome: number;
  takeHomeShare: number;
  /** Effective rates produced by the contribution amounts after CPF rounding. */
  employeeRate: number;
  employerRate: number;
  totalRate: number;
  /** Published full-wage-band schedule rates for the resolved age/citizenship. */
  nominalEmployeeRate: number;
  nominalEmployerRate: number;
  nominalTotalRate: number;
  wageBand: ContributionWageBand;
  wageBandLabel: string;
  wageBandDescription: string;
  /** Null until a post-55 FRS routing branch can be selected from account context. */
  selectedDistribution: {
    oa: number;
    retirement: number;
    ma: number;
  } | null;
  oaRate: number;
  retirementRate: number;
  maRate: number;
  /** Whether the retirement share is routed to the Retirement Account. */
  isRetirementAccount: boolean;
  routing?: ContributionRouting;
  warnings: readonly ContributionWarning[];
}

interface BuildFiguresParams {
  income: number;
  age: number;
  birthMonth?: string;
  ageGroup: AgeGroup;
  citizenship: CitizenshipStatus;
  ceilingDate: string;
  isIllustrative: boolean;
}

export function buildFigures({
  income,
  age,
  birthMonth,
  ageGroup,
  citizenship,
  ceilingDate,
  isIllustrative,
}: BuildFiguresParams): CalculatorFigures {
  const contributionMonth = CPF_POLICY_CATALOGUE.metadata[
    "cpf-contribution-rates"
  ].verifiedAt.slice(0, 7);
  const base = {
    contributionMonth,
    ordinaryWages: income,
    citizenship,
  };
  const result = calculateCpfContribution(
    birthMonth ? { ...base, birthMonth } : { ...base, age },
  );
  const ceiling = CPF_INCOME_CEILING[ceilingDate];
  const contributable = result.subjectWages.total;
  const { employee, employer, totalContribution } = result.contribution;
  const employeeRate = contributable > 0 ? employee / contributable : 0;
  const employerRate = contributable > 0 ? employer / contributable : 0;
  const wageBandCopy = getWageBandCopy(result.wageBand);
  const selectedDistribution =
    result.routing?.selected === "undetermined"
      ? null
      : {
          oa: result.distribution.OA,
          retirement: result.distribution.RA ?? result.distribution.SA ?? 0,
          ma: result.distribution.MA,
        };

  return {
    isIllustrative,
    age,
    ...(birthMonth ? { birthMonth } : {}),
    citizenship,
    contributionMonth,
    scheduleEffectiveFrom: result.schedule.effectiveFrom,
    ageGroup,
    ceilingDate,
    ceiling,
    gross: income,
    contributable,
    employee,
    employer,
    total: totalContribution,
    takeHome: result.afterCpfContribution,
    takeHomeShare: income > 0 ? result.afterCpfContribution / income : 0,
    employeeRate,
    employerRate,
    totalRate: employeeRate + employerRate,
    nominalEmployeeRate: result.schedule.employeeRate,
    nominalEmployerRate: result.schedule.employerRate,
    nominalTotalRate:
      result.schedule.employeeRate + result.schedule.employerRate,
    wageBand: result.wageBand,
    wageBandLabel: wageBandCopy.label,
    wageBandDescription: wageBandCopy.description,
    selectedDistribution,
    oaRate: ageGroup.distributionRate.OA ?? 0,
    retirementRate:
      ageGroup.distributionRate.RA ?? ageGroup.distributionRate.SA ?? 0,
    maRate: ageGroup.distributionRate.MA ?? 0,
    isRetirementAccount:
      result.routing !== undefined || result.distribution.RA !== undefined,
    ...(result.routing ? { routing: result.routing } : {}),
    warnings: result.warnings,
  };
}

/** The illustrative figures used until the visitor supplies salary and date of birth. */
export function buildIllustrativeFigures(
  ceilingDate: string,
): CalculatorFigures {
  return buildFigures({
    income: ILLUSTRATIVE_INCOME,
    age: ILLUSTRATIVE_AGE,
    ageGroup: findAgeGroup(ILLUSTRATIVE_AGE),
    citizenship: "citizen",
    ceilingDate,
    isIllustrative: true,
  });
}

/**
 * The ceiling date immediately before the one in effect, so the screen can show
 * what the latest step change did to a salary.
 */
export function findPreviousCeilingDate(ceilingDate: string): string {
  const dates = Object.keys(CPF_INCOME_CEILING).sort((left, right) =>
    left.localeCompare(right),
  );
  const index = dates.indexOf(ceilingDate);
  return index > 0 ? dates[index - 1] : dates[0];
}

/** Whole percentages stay whole; graduated rates such as 14.5% keep one decimal. */
export function formatRate(rate: number): string {
  const percentage = rate * 100;
  const hundredthPercentage = Math.round(percentage * 100) / 100;
  const decimalPlaces = Number.isInteger(hundredthPercentage)
    ? 0
    : Number.isInteger(hundredthPercentage * 10)
      ? 1
      : 2;

  return formatPercentage(rate, {
    decimalPlaces,
  });
}

export function getWageBandCopy(wageBand: ContributionWageBand): {
  label: string;
  description: string;
} {
  const rules = CPF_POLICY_CATALOGUE.rules.wageBands;
  switch (wageBand) {
    case "no-contribution":
      return {
        label: "No-contribution wage band",
        description: `Monthly wages at or below ${formatCurrency(rules.noContributionAtOrBelow, 0)} attract no CPF contribution.`,
      };
    case "employer-only":
      return {
        label: "Employer-only wage band",
        description: `For monthly wages above ${formatCurrency(rules.noContributionAtOrBelow, 0)} through ${formatCurrency(rules.employerOnlyAtOrBelow, 0)}, only the employer share applies.`,
      };
    case "phased-employee-share":
      return {
        label: "Phased employee-share wage band",
        description: `For monthly wages above ${formatCurrency(rules.employerOnlyAtOrBelow, 0)} through ${formatCurrency(rules.phasedEmployeeShareAtOrBelow, 0)}, the employee share phases in under CPF Board's formula.`,
      };
    case "full-rates":
      return {
        label: "Full-rate wage band",
        description: `Monthly wages above ${formatCurrency(rules.fullRatesAbove, 0)} use the published full schedule rates, followed by CPF's statutory rounding.`,
      };
  }
}
