import { describe, expect, it } from "vitest";
import { findAgeGroup } from "@/lib/find-age-group";
import { buildFigures } from "./figures";
import { buildCalculatorPdfData } from "./pdf-data";

const generatedAt = new Date("2026-08-01T00:00:00+08:00");

describe("calculator PDF data", () => {
  it("does not select a post-55 routing branch without RA context", () => {
    const figures = buildFigures({
      income: 8000,
      age: 56,
      ageGroup: findAgeGroup(56),
      citizenship: "citizen",
      ceilingDate: "2026-01-01",
      isIllustrative: false,
    });
    const data = buildCalculatorPdfData({
      figures,
      generatedAt,
      ceilingComparison: null,
    });

    expect(data.distribution).toBeNull();
    expect(data.routing?.selected).toBe("undetermined");
    expect(data.routing?.branches.beforeFullRetirementSum.RA).toBe(919.9);
    expect(data.routing?.branches.afterFullRetirementSum.OA).toBe(1880.06);
    expect(
      data.warnings.some((warning) =>
        warning.includes("both official branches"),
      ),
    ).toBe(true);
  });

  it("keeps effective low-wage rates and leaves AW room unavailable", () => {
    const figures = buildFigures({
      income: 600,
      age: 30,
      ageGroup: findAgeGroup(30),
      citizenship: "citizen",
      ceilingDate: "2026-01-01",
      isIllustrative: false,
    });
    const data = buildCalculatorPdfData({
      figures,
      generatedAt,
      ceilingComparison: null,
    });

    expect(data.employeeRate).toBe(0.1);
    expect(data.employerRate).toBe(0.17);
    expect(data.wageBandLabel).toBe("Phased employee-share wage band");
    expect(data.remainingAdditionalWageCeiling).toBeNull();
  });

  it("preserves 12.5% and 7.5% effective rates without whole-percent rounding", () => {
    const age61 = buildFigures({
      income: 8000,
      age: 61,
      ageGroup: findAgeGroup(61),
      citizenship: "citizen",
      ceilingDate: "2026-01-01",
      isIllustrative: false,
    });
    const age66 = buildFigures({
      income: 8000,
      age: 66,
      ageGroup: findAgeGroup(66),
      citizenship: "citizen",
      ceilingDate: "2026-01-01",
      isIllustrative: false,
    });

    const age61Data = buildCalculatorPdfData({
      figures: age61,
      generatedAt,
      ceilingComparison: null,
    });
    const age66Data = buildCalculatorPdfData({
      figures: age66,
      generatedAt,
      ceilingComparison: null,
    });

    expect(age61Data.employeeRate).toBe(0.125);
    expect(age61Data.employerRate).toBe(0.125);
    expect(age66Data.employeeRate).toBe(0.075);
    expect(age66Data.employerRate).toBe(0.09);
  });
});
