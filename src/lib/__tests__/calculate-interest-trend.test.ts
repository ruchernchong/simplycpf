import { describe, expect, it } from "vitest";
import {
  type OfficialQuarterlyCpfRate,
  QUARTERLY_CPF_RATES,
} from "@/constants/cpf-interest-rates";
import {
  calculateInterestTrend,
  calculateSmraRate,
  isFloorRateApplied,
} from "@/lib/calculate-interest-trend";

describe("calculateSmraRate", () => {
  it.each([
    { averageSgsYield: 2.5, expected: 4 },
    { averageSgsYield: 3, expected: 4 },
    { averageSgsYield: 3.5, expected: 4.5 },
  ])("applies the 4% floor to a $averageSgsYield% 12-month average", ({
    averageSgsYield,
    expected,
  }) => {
    expect(calculateSmraRate(averageSgsYield)).toBe(expected);
  });
});

describe("isFloorRateApplied", () => {
  it("returns true only when the computed rate is below the floor", () => {
    expect(isFloorRateApplied(2.5)).toBe(true);
    expect(isFloorRateApplied(3)).toBe(false);
    expect(isFloorRateApplied(3.5)).toBe(false);
  });
});

describe("calculateInterestTrend", () => {
  it("matches the CPF Board declarations from 2023 Q1 through 2026 Q3", () => {
    expect(
      QUARTERLY_CPF_RATES.map(({ quarter, oa, sa, ma, ra }) => ({
        quarter,
        oa,
        sa,
        ma,
        ra,
      })),
    ).toEqual([
      { quarter: "2023 Q1", oa: 2.5, sa: 4, ma: 4, ra: 4 },
      { quarter: "2023 Q2", oa: 2.5, sa: 4, ma: 4, ra: 4 },
      { quarter: "2023 Q3", oa: 2.5, sa: 4.01, ma: 4.01, ra: 4 },
      { quarter: "2023 Q4", oa: 2.5, sa: 4.04, ma: 4.04, ra: 4 },
      { quarter: "2024 Q1", oa: 2.5, sa: 4.08, ma: 4.08, ra: 4.08 },
      { quarter: "2024 Q2", oa: 2.5, sa: 4.05, ma: 4.05, ra: 4.05 },
      { quarter: "2024 Q3", oa: 2.5, sa: 4.08, ma: 4.08, ra: 4.08 },
      { quarter: "2024 Q4", oa: 2.5, sa: 4.14, ma: 4.14, ra: 4.14 },
      { quarter: "2025 Q1", oa: 2.5, sa: 4, ma: 4, ra: 4 },
      { quarter: "2025 Q2", oa: 2.5, sa: 4, ma: 4, ra: 4 },
      { quarter: "2025 Q3", oa: 2.5, sa: 4, ma: 4, ra: 4 },
      { quarter: "2025 Q4", oa: 2.5, sa: 4, ma: 4, ra: 4 },
      { quarter: "2026 Q1", oa: 2.5, sa: 4, ma: 4, ra: 4 },
      { quarter: "2026 Q2", oa: 2.5, sa: 4, ma: 4, ra: 4 },
      { quarter: "2026 Q3", oa: 2.5, sa: 4, ma: 4, ra: 4 },
    ]);
  });

  it("returns the official quarterly declarations without synthetic SGS data", () => {
    const result = calculateInterestTrend();

    expect(result).toHaveLength(15);
    expect(result.at(-1)).toEqual({
      quarter: "2026 Q3",
      effectiveFrom: "2026-07-01",
      effectiveTo: "2026-09-30",
      oaRate: 2.5,
      saRate: 4,
      maRate: 4,
      raRate: 4,
      sourceUrl:
        "https://www.cpf.gov.sg/member/infohub/news/news-releases/cpf-interest-rates-from-1-july-to-30-september-2026",
      status: "official",
      verifiedAt: "2026-08-01",
    });
    expect(result.every((row) => !("sgsYield" in row))).toBe(true);
  });

  it("preserves the declaration and provenance for supplied official rows", () => {
    const rates: readonly OfficialQuarterlyCpfRate[] = [
      {
        quarter: "2026 Q3",
        effectiveFrom: "2026-07-01",
        effectiveTo: "2026-09-30",
        oa: 2.5,
        sa: 4,
        ma: 4,
        ra: 4,
        sourceUrl:
          "https://www.cpf.gov.sg/service/article/what-are-the-cpf-interest-rates",
        status: "official",
        verifiedAt: "2026-08-01",
      },
    ];

    expect(calculateInterestTrend(rates)).toEqual([
      {
        quarter: "2026 Q3",
        effectiveFrom: "2026-07-01",
        effectiveTo: "2026-09-30",
        oaRate: 2.5,
        saRate: 4,
        maRate: 4,
        raRate: 4,
        sourceUrl:
          "https://www.cpf.gov.sg/service/article/what-are-the-cpf-interest-rates",
        status: "official",
        verifiedAt: "2026-08-01",
      },
    ]);
  });

  it("supports an empty official observation list", () => {
    expect(calculateInterestTrend([])).toEqual([]);
  });

  it("keeps all declared account rates aligned from 2025 onward", () => {
    for (const row of QUARTERLY_CPF_RATES.filter(
      ({ quarter }) => quarter.startsWith("2025") || quarter.startsWith("2026"),
    )) {
      expect(row.sa).toBe(row.ma);
      expect(row.ma).toBe(row.ra);
    }
  });
});
