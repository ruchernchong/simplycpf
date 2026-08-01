import {
  CPF_INTEREST_FLOOR_RATES,
  CPF_QUARTERLY_INTEREST_RATES,
  CPF_SMRA_PEGGED_RATE_MARKUP,
  type OfficialQuarterlyCpfInterestRate,
} from "@/policy";

export interface OfficialInterestRateObservation {
  quarter: string;
  effectiveFrom: string;
  effectiveTo: string;
  oaRate: number;
  saRate: number;
  maRate: number;
  raRate: number;
  sourceUrl: string;
  status: "official";
  verifiedAt: OfficialQuarterlyCpfInterestRate["verifiedAt"];
}

/**
 * Apply CPF Board's SMRA formula to the published 12-month average 10YSGS
 * yield. The caller supplies the average, not an individual monthly yield.
 */
export function calculateSmraRate(averageSgsYield: number): number {
  return Math.max(
    averageSgsYield + CPF_SMRA_PEGGED_RATE_MARKUP,
    CPF_INTEREST_FLOOR_RATES.SMRA,
  );
}

export function isFloorRateApplied(averageSgsYield: number): boolean {
  return (
    averageSgsYield + CPF_SMRA_PEGGED_RATE_MARKUP <
    CPF_INTEREST_FLOOR_RATES.SMRA
  );
}

/** Return CPF Board's official quarterly declarations without interpolation. */
export function calculateInterestTrend(
  rates: readonly OfficialQuarterlyCpfInterestRate[] = CPF_QUARTERLY_INTEREST_RATES,
): OfficialInterestRateObservation[] {
  return rates.map((rate) => ({
    quarter: rate.quarter,
    effectiveFrom: rate.effectiveFrom,
    effectiveTo: rate.effectiveTo,
    oaRate: rate.oa,
    saRate: rate.sa,
    maRate: rate.ma,
    raRate: rate.ra,
    sourceUrl: rate.sourceUrl,
    status: rate.status,
    verifiedAt: rate.verifiedAt,
  }));
}
