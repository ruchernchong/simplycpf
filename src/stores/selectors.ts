import { CPF_INCOME_CEILING } from "@/constants";
import {
  permanentResidentYear1Rates,
  permanentResidentYear2Rates,
} from "@/data/permanent-resident-rates";
import { calculateCpfContribution } from "@/lib/calculate-cpf-contribution";
import { convertBirthDateToAge } from "@/lib/convert-birth-date-to-age";
import { findAgeGroup } from "@/lib/find-age-group";
import type {
  AgeGroup,
  CeilingComparisonResult,
  CitizenshipStatus,
  ComputedResult,
  DistributionResult,
} from "@/types";
import { isValidDateFormat } from "@/utils/date-utils";
import type { CpfState } from "./cpf-store";

/**
 * Form step type for calculator progression
 * 0: No valid birth date or income
 * 1: Valid birth date only
 * 2: Valid birth date and income
 * 3: Reserved for future use
 */
export type FormStep = 0 | 1 | 2 | 3;

/**
 * Select the age from the birth date stored in settings.
 *
 * @param state - The CPF store state
 * @returns The calculated age or 0 if birthDate is empty
 */
export const selectAge = (state: CpfState): number => {
  return convertBirthDateToAge(state.settings.birthDate) || 0;
};

/**
 * Select the citizenship status from settings.
 *
 * @param state - The CPF store state
 * @returns The citizenship status
 */
export const selectCitizenshipStatus = (state: CpfState): CitizenshipStatus => {
  return state.settings.citizenshipStatus;
};

/**
 * Select the appropriate age group based on age and citizenship status.
 *
 * - SPR Year 1: Uses reduced contribution rates for first-year PRs
 * - SPR Year 2: Uses graduated contribution rates for second-year PRs
 * - SPR Year 3+ and Citizens: Uses full citizen rates
 *
 * @param state - The CPF store state
 * @returns The matching AgeGroup
 */
export const selectAgeGroup = (state: CpfState): AgeGroup => {
  const age = selectAge(state);
  const citizenshipStatus = selectCitizenshipStatus(state);

  if (citizenshipStatus === "spr-year1") {
    return findAgeGroup(age, permanentResidentYear1Rates);
  }

  if (citizenshipStatus === "spr-year2") {
    return findAgeGroup(age, permanentResidentYear2Rates);
  }

  // SPR Year 3+ and citizens use full citizen rates
  return findAgeGroup(age);
};

/**
 * Select the monthly gross income from settings.
 *
 * @param state - The CPF store state
 * @returns The monthly gross income
 */
export const selectMonthlyGrossIncome = (state: CpfState): number => {
  return state.settings.monthlyGrossIncome;
};

/**
 * Select whether input should be stored (persisted).
 *
 * @param state - The CPF store state
 * @returns The shouldStoreInput flag
 */
export const selectShouldStoreInput = (state: CpfState): boolean => {
  return state.settings.shouldStoreInput;
};

/**
 * Select the birth date from settings.
 *
 * @param state - The CPF store state
 * @returns The birth date string
 */
export const selectBirthDate = (state: CpfState): string => {
  return state.settings.birthDate;
};

/**
 * Selector factory for getting computed CPF calculation inputs.
 * Useful for passing to the calculateCpfContribution function.
 *
 * @param state - The CPF store state
 * @returns Object with income, ageGroup, and other calculation inputs
 */
export const selectCpfCalculationInputs = (state: CpfState) => {
  return {
    income: selectMonthlyGrossIncome(state),
    ageGroup: selectAgeGroup(state),
  };
};

/**
 * Select the latest income ceiling date from state.
 *
 * @param state - The CPF store state
 * @returns The latest income ceiling date string (e.g., "2024-01-01")
 */
export const selectLatestIncomeCeilingDate = (state: CpfState): string => {
  return state.latestIncomeCeilingDate;
};

/**
 * Select the income ceiling value for the latest date.
 *
 * @param state - The CPF store state
 * @returns The income ceiling amount (e.g., 6800)
 */
export const selectIncomeCeiling = (state: CpfState): number => {
  return CPF_INCOME_CEILING[state.latestIncomeCeilingDate];
};

/**
 * Select the current form step based on user input validity.
 *
 * Form steps:
 * - 0: No valid birth date or income (initial state)
 * - 1: Valid birth date only (show partial results)
 * - 2: Valid birth date and income (show full results)
 * - 3: Reserved for future use
 *
 * This is a computed selector that derives the step from current settings,
 * ensuring form step always stays in sync with user input.
 *
 * @param state - The CPF store state
 * @returns The current form step (0, 1, or 2)
 */
export const selectFormStep = (state: CpfState): FormStep => {
  const { birthDate, monthlyGrossIncome } = state.settings;

  const hasValidBirthDate = isValidDateFormat(birthDate);
  const hasValidIncome = monthlyGrossIncome > 0;

  if (!hasValidBirthDate && !hasValidIncome) return 0;
  if (hasValidBirthDate && !hasValidIncome) return 1;
  if (hasValidBirthDate && hasValidIncome) return 2;
  return 0;
};

/**
 * Select the computed CPF contribution result.
 *
 * Calculates the CPF contribution based on current income, income ceiling date,
 * and age group. This is the core calculation for the calculator.
 *
 * @param state - The CPF store state
 * @returns The ComputedResult with contribution details and distribution
 */
export const selectContributionResult = (state: CpfState): ComputedResult => {
  return calculateCpfContribution(
    selectMonthlyGrossIncome(state),
    selectLatestIncomeCeilingDate(state),
    { ageGroup: selectAgeGroup(state) },
  );
};

/**
 * Select the distribution results as an array.
 *
 * Transforms the distribution object from ComputedResult into an array
 * of name/value pairs for use in charts and tables.
 *
 * @param state - The CPF store state
 * @returns Array of DistributionResult objects
 */
export const selectDistributionResults = (
  state: CpfState,
): DistributionResult[] => {
  const contributionResult = selectContributionResult(state);
  return Object.entries(contributionResult.distribution).map(
    ([name, value]) => ({
      name,
      value,
    }),
  );
};

/**
 * Select whether there is any CPF contribution.
 *
 * Returns true if the total contribution is greater than 0.
 * Used to conditionally show distribution views.
 *
 * @param state - The CPF store state
 * @returns Boolean indicating if there is a CPF contribution
 */
export const selectHasCpfContribution = (state: CpfState): boolean => {
  const contributionResult = selectContributionResult(state);
  return contributionResult.contribution.totalContribution > 0;
};

/**
 * Select the ceiling comparison result.
 *
 * Compares CPF contributions under the current income ceiling vs the
 * pre-September 2023 ceiling. Shows the impact of ceiling changes on
 * take-home pay and total CPF contributions.
 *
 * @param state - The CPF store state
 * @returns CeilingComparisonResult with comparison data
 */
export const selectCeilingComparison = (
  state: CpfState,
): CeilingComparisonResult => {
  const currentResult = selectContributionResult(state);
  const income = selectMonthlyGrossIncome(state);
  const ageGroup = selectAgeGroup(state);
  const currentCeilingDate = selectLatestIncomeCeilingDate(state);

  const preSept2023Result = calculateCpfContribution(
    income,
    currentCeilingDate,
    { ageGroup, useCeilingBeforeSep2023: true },
  );

  return {
    preSept2023Result,
    takeHomePayDifference:
      preSept2023Result.afterCpfContribution -
      currentResult.afterCpfContribution,
    totalContributionDifference:
      preSept2023Result.contribution.totalContribution -
      currentResult.contribution.totalContribution,
  };
};
