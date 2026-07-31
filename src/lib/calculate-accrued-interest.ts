import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";

export interface AccruedInterestYearRow {
  year: number;
  cumulativeInterest: number;
}

export interface AccruedInterestResult {
  principal: number;
  yearsHeld: number;
  /** Principal plus accrued interest, refundable to CPF on sale */
  totalOwed: number;
  accruedInterest: number;
  yearlyRows: AccruedInterestYearRow[];
  /** Illustrative sale price: 2.4× principal, rounded to the nearest $10k */
  illustrativeSalePrice: number;
  refundToCpf: number;
  cashProceeds: number;
}

/**
 * OA money used for a property keeps a running tab: the interest it would
 * have earned at the OA floor rate had it stayed. On sale, the principal plus
 * that accrued interest returns to CPF before any cash is paid out. A refund
 * to yourself, not a penalty, but it changes what a sale actually pays out.
 *
 * Models a single lump-sum withdrawal compounding yearly. Monthly instalments,
 * valuation limits, appreciation, fees and post-55 rules are not modelled.
 */
export function calculateAccruedInterest(
  oaUsed: number,
  yearsHeld: number,
  rate: number = CPF_INTEREST_FLOOR_RATES.OA / 100,
): AccruedInterestResult {
  const principal = Math.max(0, oaUsed);
  const years = Math.max(0, Math.floor(yearsHeld));

  const totalOwed = principal * (1 + rate) ** years;
  const accruedInterest = totalOwed - principal;

  const yearlyRows: AccruedInterestYearRow[] = [];
  for (let year = 1; year <= years; year++) {
    yearlyRows.push({
      year,
      cumulativeInterest: principal * (1 + rate) ** year - principal,
    });
  }

  const illustrativeSalePrice = Math.round((principal * 2.4) / 10_000) * 10_000;
  const refundToCpf = Math.min(totalOwed, illustrativeSalePrice);
  const cashProceeds = Math.max(0, illustrativeSalePrice - totalOwed);

  return {
    principal,
    yearsHeld: years,
    totalOwed,
    accruedInterest,
    yearlyRows,
    illustrativeSalePrice,
    refundToCpf,
    cashProceeds,
  };
}
