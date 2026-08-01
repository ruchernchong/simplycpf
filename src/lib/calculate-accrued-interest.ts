import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";

export interface AccruedInterestYearRow {
  year: number;
  cumulativeInterest: number;
}

export interface AccruedInterestInput {
  /** One lump-sum OA withdrawal used for the property. */
  oaUsed: number;
  yearsHeld: number;
  /** User-entered expected selling price, assumed to be market value. */
  marketValueSalePrice: number;
  outstandingHousingLoan: number;
  annualRate?: number;
}

export interface AccruedInterestResult {
  principal: number;
  yearsHeld: number;
  annualRate: number;
  requiredRefund: number;
  accruedInterest: number;
  yearlyRows: AccruedInterestYearRow[];
  marketValueSalePrice: number;
  outstandingHousingLoan: number;
  netSaleProceeds: number;
  refundToCpf: number;
  refundShortfall: number;
  cashProceeds: number;
}

/**
 * Model one lump-sum OA housing withdrawal over whole years.
 *
 * CPF Board requires the principal used plus accrued interest to be refunded
 * on sale. When a property is sold at market value and sale proceeds are
 * insufficient, the refund is limited to selling price less the outstanding
 * housing loan; the owner does not need to top up that shortfall in cash.
 *
 * Monthly housing instalments, transaction costs, property pledges, co-owner
 * apportionment and the special pre-2013 exception are outside this model.
 */
export function calculateAccruedInterest({
  oaUsed,
  yearsHeld,
  marketValueSalePrice,
  outstandingHousingLoan,
  annualRate = CPF_INTEREST_FLOOR_RATES.OA / 100,
}: AccruedInterestInput): AccruedInterestResult {
  const principal = Math.max(0, oaUsed);
  const years = Math.max(0, Math.floor(yearsHeld));
  const rate = Math.max(0, annualRate);
  const salePrice = Math.max(0, marketValueSalePrice);
  const outstandingLoan = Math.max(0, outstandingHousingLoan);

  const requiredRefund = principal * (1 + rate) ** years;
  const accruedInterest = requiredRefund - principal;
  const netSaleProceeds = Math.max(0, salePrice - outstandingLoan);
  const refundToCpf = Math.min(requiredRefund, netSaleProceeds);
  const refundShortfall = requiredRefund - refundToCpf;
  const cashProceeds = netSaleProceeds - refundToCpf;

  const yearlyRows: AccruedInterestYearRow[] = [];
  for (let year = 1; year <= years; year++) {
    yearlyRows.push({
      year,
      cumulativeInterest: principal * (1 + rate) ** year - principal,
    });
  }

  return {
    principal,
    yearsHeld: years,
    annualRate: rate,
    requiredRefund,
    accruedInterest,
    yearlyRows,
    marketValueSalePrice: salePrice,
    outstandingHousingLoan: outstandingLoan,
    netSaleProceeds,
    refundToCpf,
    refundShortfall,
    cashProceeds,
  };
}
