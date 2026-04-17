export const CPF_RETIREMENT_SUMS: Record<
  string,
  { brs: number; frs: number; ers: number }
> = {
  "2024": { brs: 102_900, frs: 205_800, ers: 411_600 },
  "2025": { brs: 106_500, frs: 213_000, ers: 426_000 },
  "2026": { brs: 110_200, frs: 220_400, ers: 440_800 },
};

const RETIREMENT_SUM_GROWTH_RATE = 0.035;

export function getRetirementSumsForYear(year: number): {
  brs: number;
  frs: number;
  ers: number;
} {
  const yearKey = year.toString();

  if (CPF_RETIREMENT_SUMS[yearKey]) {
    return CPF_RETIREMENT_SUMS[yearKey];
  }

  const knownYears = Object.keys(CPF_RETIREMENT_SUMS)
    .map(Number)
    .sort((a, b) => a - b);
  const latestYear = knownYears[knownYears.length - 1];
  const latest = CPF_RETIREMENT_SUMS[latestYear.toString()];
  const yearsDiff = year - latestYear;

  if (yearsDiff <= 0) {
    return CPF_RETIREMENT_SUMS[knownYears[0].toString()];
  }

  const brs =
    Math.round(
      (latest.brs * (1 + RETIREMENT_SUM_GROWTH_RATE) ** yearsDiff) / 100,
    ) * 100;
  const frs = brs * 2;
  const ers = brs * 4;

  return { brs, frs, ers };
}
