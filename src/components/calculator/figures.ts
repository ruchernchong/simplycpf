import { CPF_INCOME_CEILING } from "@/constants";
import { calculateCpfContribution } from "@/lib/calculate-cpf-contribution";
import { findAgeGroup } from "@/lib/find-age-group";
import { formatPercentage } from "@/lib/format";
import type { AgeGroup } from "@/types";

/** Figures shown before the visitor has entered anything of their own. */
export const ILLUSTRATIVE_INCOME = 5000;
export const ILLUSTRATIVE_AGE = 32;

export interface CalculatorFigures {
  /** True when the numbers come from the illustrative defaults, not the visitor. */
  isIllustrative: boolean;
  age: number;
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
  employeeRate: number;
  employerRate: number;
  totalRate: number;
  oa: number;
  sa: number;
  ma: number;
  oaRate: number;
  saRate: number;
  maRate: number;
  /** Special Account closes at 55 and the share goes to the Retirement Account. */
  isRetirementAccount: boolean;
}

interface BuildFiguresParams {
  income: number;
  age: number;
  ageGroup: AgeGroup;
  ceilingDate: string;
  isIllustrative: boolean;
}

export function buildFigures({
  income,
  age,
  ageGroup,
  ceilingDate,
  isIllustrative,
}: BuildFiguresParams): CalculatorFigures {
  const result = calculateCpfContribution(income, ceilingDate, { ageGroup });
  const ceiling = CPF_INCOME_CEILING[ceilingDate];
  const contributable = Math.min(income, ceiling);
  const { employee, employer, totalContribution } = result.contribution;

  return {
    isIllustrative,
    age,
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
    employeeRate: ageGroup.contributionRate.employee,
    employerRate: ageGroup.contributionRate.employer,
    totalRate:
      ageGroup.contributionRate.employee + ageGroup.contributionRate.employer,
    oa: result.distribution.OA ?? 0,
    sa: result.distribution.SA ?? 0,
    ma: result.distribution.MA ?? 0,
    oaRate: ageGroup.distributionRate.OA ?? 0,
    saRate: ageGroup.distributionRate.SA ?? 0,
    maRate: ageGroup.distributionRate.MA ?? 0,
    isRetirementAccount: age > 55,
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
    ceilingDate,
    isIllustrative: true,
  });
}

/**
 * The ceiling date immediately before the one in effect, so the screen can show
 * what the latest step change did to a salary.
 */
export function findPreviousCeilingDate(ceilingDate: string): string {
  const dates = Object.keys(CPF_INCOME_CEILING).sort();
  const index = dates.indexOf(ceilingDate);
  return index > 0 ? dates[index - 1] : dates[0];
}

/** Whole percentages stay whole; graduated rates such as 14.5% keep one decimal. */
export function formatRate(rate: number): string {
  return formatPercentage(rate, {
    decimalPlaces: Number.isInteger(Math.round(rate * 10000) / 100) ? 0 : 1,
  });
}
