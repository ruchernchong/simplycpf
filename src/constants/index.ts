import type { CPFIncomeCeiling } from "@/types";

export const DEFAULT_CPF_INCOME_CEILING = 6000;
export const CPF_INCOME_CEILING_BEFORE_SEPT_2023: number = 6000;
export const CPF_ADDITIONAL_WAGE_CEILING: number = 102000;

export const CPF_INCOME_CEILING: CPFIncomeCeiling = {
  "2023-01-01": 6000,
  "2023-09-01": 6300,
  "2024-01-01": 6800,
  "2025-01-01": 7400,
  "2026-01-01": 8000,
};

export function getCeilingForYear(year: number): number {
  const yearEnd = new Date(`${year}-12-31`);
  const sortedEntries = Object.entries(CPF_INCOME_CEILING).sort(
    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime(),
  );

  let ceiling = CPF_INCOME_CEILING_BEFORE_SEPT_2023;
  for (const [effectiveDate, value] of sortedEntries) {
    if (new Date(effectiveDate) <= yearEnd) {
      ceiling = value;
    } else {
      break;
    }
  }
  return ceiling;
}

export const CPF_ACCOUNT_MAP: Record<string, string> = {
  OA: "Ordinary Account",
  SA: "Special Account",
  MA: "Medisave Account",
  RA: "Retirement Account",
};
