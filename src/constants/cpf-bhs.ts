export const CPF_BASIC_HEALTHCARE_SUM: Record<string, number> = {
  "2016": 49_800,
  "2017": 52_000,
  "2018": 54_500,
  "2019": 57_200,
  "2020": 60_000,
  "2021": 63_000,
  "2022": 66_000,
  "2023": 68_500,
  "2024": 71_500,
  "2025": 75_500,
  "2026": 79_000,
};

const BHS_GROWTH_RATE = 3500;

export function getBhsForYear(year: number): number {
  const knownYears = Object.keys(CPF_BASIC_HEALTHCARE_SUM)
    .map(Number)
    .sort((a, b) => a - b);
  const earliestYear = knownYears[0];
  const latestYear = knownYears[knownYears.length - 1];

  if (year <= earliestYear) {
    return CPF_BASIC_HEALTHCARE_SUM[earliestYear.toString()];
  }

  const known = CPF_BASIC_HEALTHCARE_SUM[year.toString()];
  if (known) return known;

  return (
    CPF_BASIC_HEALTHCARE_SUM[latestYear.toString()] +
    BHS_GROWTH_RATE * (year - latestYear)
  );
}
