import {
  CPF_CONTRIBUTION_SCHEDULES,
  CPF_WAGE_RULES,
  getOfficialOrdinaryWageCeiling,
} from "@/policy";
import type { CPFIncomeCeiling } from "@/types";

const firstPublishedSchedule = CPF_CONTRIBUTION_SCHEDULES[0];
if (!firstPublishedSchedule) {
  throw new Error("At least one CPF contribution schedule is required.");
}

export const DEFAULT_CPF_INCOME_CEILING =
  firstPublishedSchedule.ordinaryWageCeiling;
export const CPF_INCOME_CEILING_BEFORE_SEPT_2023 =
  firstPublishedSchedule.ordinaryWageCeiling;
export const CPF_ADDITIONAL_WAGE_CEILING =
  CPF_WAGE_RULES.annualAdditionalWageCeiling;

/**
 * Compatibility timeline containing only dates on which the OW ceiling
 * changed. The complete official schedule lives in `src/policy`.
 */
export const CPF_INCOME_CEILING: CPFIncomeCeiling = Object.fromEntries(
  CPF_CONTRIBUTION_SCHEDULES.filter((schedule, index, schedules) => {
    const previous = schedules[index - 1];
    return (
      previous === undefined ||
      previous.ordinaryWageCeiling !== schedule.ordinaryWageCeiling
    );
  }).map((schedule) => [schedule.effectiveFrom, schedule.ordinaryWageCeiling]),
);

export function getCeilingForMonth(contributionMonth: string): number {
  return getOfficialOrdinaryWageCeiling(contributionMonth);
}

export function getCeilingForYear(year: number): number {
  if (!Number.isInteger(year)) {
    throw new Error("CPF policy year must be a whole calendar year.");
  }
  return getOfficialOrdinaryWageCeiling(`${year}-12`);
}

export const CPF_ACCOUNT_MAP: Record<string, string> = {
  OA: "Ordinary Account",
  SA: "Special Account",
  MA: "MediSave Account",
  RA: "Retirement Account",
};
