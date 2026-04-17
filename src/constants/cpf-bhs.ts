export const CPF_BASIC_HEALTHCARE_SUM: Record<string, number> = {
  "2024": 71_500,
  "2025": 73_500,
  "2026": 75_500,
};

const BHS_GROWTH_RATE = 2000;

export function getBhsForYear(year: number): number {
  const yearKey = year.toString();

  if (CPF_BASIC_HEALTHCARE_SUM[yearKey]) {
    return CPF_BASIC_HEALTHCARE_SUM[yearKey];
  }

  const knownYears = Object.keys(CPF_BASIC_HEALTHCARE_SUM)
    .map(Number)
    .sort((a, b) => a - b);
  const latestYear = knownYears[knownYears.length - 1];
  const latest = CPF_BASIC_HEALTHCARE_SUM[latestYear.toString()];
  const yearsDiff = year - latestYear;

  if (yearsDiff <= 0) {
    return CPF_BASIC_HEALTHCARE_SUM[knownYears[0].toString()];
  }

  return latest + BHS_GROWTH_RATE * yearsDiff;
}
