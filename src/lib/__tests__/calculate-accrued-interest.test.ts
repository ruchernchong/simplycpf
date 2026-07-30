import { describe, expect, it } from "vitest";
import { calculateAccruedInterest } from "@/lib/calculate-accrued-interest";

describe("calculateAccruedInterest", () => {
  it.each([
    { oaUsed: 150_000, years: 5, expectedTotal: 150_000 * 1.025 ** 5 },
    { oaUsed: 250_000, years: 10, expectedTotal: 250_000 * 1.025 ** 10 },
    { oaUsed: 400_000, years: 20, expectedTotal: 400_000 * 1.025 ** 20 },
  ])("compounds $oaUsed at the OA floor rate over $years years", ({
    oaUsed,
    years,
    expectedTotal,
  }) => {
    const result = calculateAccruedInterest(oaUsed, years);

    expect(result.totalOwed).toBeCloseTo(expectedTotal, 6);
    expect(result.accruedInterest).toBeCloseTo(expectedTotal - oaUsed, 6);
    expect(result.yearlyRows).toHaveLength(years);
    expect(result.yearlyRows.at(-1)?.cumulativeInterest).toBeCloseTo(
      expectedTotal - oaUsed,
      6,
    );
  });

  it("builds strictly increasing cumulative interest rows", () => {
    const { yearlyRows } = calculateAccruedInterest(250_000, 10);

    for (let index = 1; index < yearlyRows.length; index++) {
      expect(yearlyRows[index].cumulativeInterest).toBeGreaterThan(
        yearlyRows[index - 1].cumulativeInterest,
      );
    }
  });

  it("rounds the illustrative sale price to the nearest $10,000", () => {
    expect(calculateAccruedInterest(250_000, 10).illustrativeSalePrice).toBe(
      600_000,
    );
    expect(calculateAccruedInterest(151_000, 10).illustrativeSalePrice).toBe(
      360_000,
    );
  });

  it("returns no accrued interest for zero years held", () => {
    const result = calculateAccruedInterest(250_000, 0);

    expect(result.totalOwed).toBe(250_000);
    expect(result.accruedInterest).toBe(0);
    expect(result.yearlyRows).toHaveLength(0);
    expect(result.cashProceeds).toBe(result.illustrativeSalePrice - 250_000);
  });

  it("caps the refund at the sale price when the tab exceeds it", () => {
    const result = calculateAccruedInterest(100, 40, 0.5);

    expect(result.totalOwed).toBeGreaterThan(result.illustrativeSalePrice);
    expect(result.refundToCpf).toBe(result.illustrativeSalePrice);
    expect(result.cashProceeds).toBe(0);
  });

  it("clamps negative principal and fractional years", () => {
    const negative = calculateAccruedInterest(-500, 10);
    expect(negative.principal).toBe(0);
    expect(negative.totalOwed).toBe(0);

    const fractional = calculateAccruedInterest(100_000, 7.9);
    expect(fractional.yearsHeld).toBe(7);
  });

  it("accepts a custom interest rate", () => {
    const result = calculateAccruedInterest(100_000, 1, 0.04);

    expect(result.totalOwed).toBeCloseTo(104_000, 6);
  });
});
