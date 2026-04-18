export const FRS_MULTIPLIER_OF_BRS = 2;
export const ERS_MULTIPLIER_OF_FRS = 2;

export const CPF_RETIREMENT_SUMS: Record<
  string,
  { brs: number; frs: number; ers: number }
> = {
  "2024": { brs: 102_900, frs: 205_800, ers: 308_700 },
  "2025": { brs: 106_500, frs: 213_000, ers: 426_000 },
  "2026": { brs: 110_200, frs: 220_400, ers: 440_800 },
};

const RETIREMENT_SUM_GROWTH_RATE = 0.035;

export function getRetirementSumsForYear(year: number): {
  brs: number;
  frs: number;
  ers: number;
} {
  const knownYears = Object.keys(CPF_RETIREMENT_SUMS)
    .map(Number)
    .sort((a, b) => a - b);
  const earliestYear = knownYears[0];
  const latestYear = knownYears[knownYears.length - 1];

  if (year <= earliestYear) {
    return CPF_RETIREMENT_SUMS[earliestYear.toString()];
  }

  const known = CPF_RETIREMENT_SUMS[year.toString()];
  if (known) return known;

  const latest = CPF_RETIREMENT_SUMS[latestYear.toString()];
  const yearsDiff = year - latestYear;
  const brs =
    Math.round(
      (latest.brs * (1 + RETIREMENT_SUM_GROWTH_RATE) ** yearsDiff) / 100,
    ) * 100;
  const frs = brs * FRS_MULTIPLIER_OF_BRS;
  const ers = frs * ERS_MULTIPLIER_OF_FRS;

  return { brs, frs, ers };
}
