import { describe, expect, it } from "vitest";
import { calculateAccruedInterest } from "@/lib/calculate-accrued-interest";

function calculate(
  oaUsed: number,
  yearsHeld: number,
  marketValueSalePrice = 600_000,
  outstandingHousingLoan = 100_000,
  annualRate?: number,
) {
  return calculateAccruedInterest({
    oaUsed,
    yearsHeld,
    marketValueSalePrice,
    outstandingHousingLoan,
    annualRate,
  });
}

describe("calculateAccruedInterest", () => {
  it.each([
    { oaUsed: 150_000, years: 5, expectedTotal: 150_000 * 1.025 ** 5 },
    { oaUsed: 250_000, years: 10, expectedTotal: 250_000 * 1.025 ** 10 },
    { oaUsed: 400_000, years: 20, expectedTotal: 400_000 * 1.025 ** 20 },
  ])("compounds a single $oaUsed withdrawal at the OA floor over $years years", ({
    oaUsed,
    years,
    expectedTotal,
  }) => {
    const result = calculate(oaUsed, years, 2_000_000, 0);

    expect(result.requiredRefund).toBeCloseTo(expectedTotal, 6);
    expect(result.accruedInterest).toBeCloseTo(expectedTotal - oaUsed, 6);
    expect(result.yearlyRows).toHaveLength(years);
    expect(result.yearlyRows.at(-1)?.cumulativeInterest).toBeCloseTo(
      expectedTotal - oaUsed,
      6,
    );
  });

  it("uses market-value sale proceeds after the outstanding loan", () => {
    const result = calculate(250_000, 10, 650_000, 200_000);

    expect(result.netSaleProceeds).toBe(450_000);
    expect(result.refundToCpf).toBeCloseTo(250_000 * 1.025 ** 10, 6);
    expect(result.cashProceeds).toBeCloseTo(450_000 - 250_000 * 1.025 ** 10, 6);
    expect(result.refundShortfall).toBe(0);
  });

  it("caps the refund at net sale proceeds for a market-value sale", () => {
    const result = calculate(250_000, 10, 300_000, 100_000);

    expect(result.requiredRefund).toBeGreaterThan(result.netSaleProceeds);
    expect(result.refundToCpf).toBe(200_000);
    expect(result.refundShortfall).toBeCloseTo(
      result.requiredRefund - 200_000,
      6,
    );
    expect(result.cashProceeds).toBe(0);
  });

  it("never creates negative proceeds when the loan exceeds the sale price", () => {
    const result = calculate(100_000, 5, 400_000, 450_000);

    expect(result.netSaleProceeds).toBe(0);
    expect(result.refundToCpf).toBe(0);
    expect(result.cashProceeds).toBe(0);
    expect(result.refundShortfall).toBe(result.requiredRefund);
  });

  it("returns no accrued interest for zero years held", () => {
    const result = calculate(250_000, 0);

    expect(result.requiredRefund).toBe(250_000);
    expect(result.accruedInterest).toBe(0);
    expect(result.yearlyRows).toHaveLength(0);
  });

  it("clamps negative amounts and fractional years", () => {
    const negative = calculateAccruedInterest({
      oaUsed: -500,
      yearsHeld: 10,
      marketValueSalePrice: -1,
      outstandingHousingLoan: -1,
    });
    expect(negative.principal).toBe(0);
    expect(negative.requiredRefund).toBe(0);
    expect(negative.marketValueSalePrice).toBe(0);
    expect(negative.outstandingHousingLoan).toBe(0);

    const fractional = calculate(100_000, 7.9);
    expect(fractional.yearsHeld).toBe(7);
  });

  it("accepts a custom non-negative interest rate", () => {
    const result = calculate(100_000, 1, 600_000, 0, 0.04);

    expect(result.requiredRefund).toBeCloseTo(104_000, 6);
    expect(result.annualRate).toBe(0.04);
  });
});
