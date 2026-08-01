import { describe, expect, it } from "vitest";
import { findAgeGroup } from "@/lib/find-age-group";
import { buildFigures, formatRate } from "./figures";

const currentCeilingDate = "2026-01-01";

describe("calculator public figures", () => {
  it("keeps the post-55 retirement allocation and both FRS routing branches", () => {
    const figures = buildFigures({
      income: 8000,
      age: 56,
      ageGroup: findAgeGroup(56),
      citizenship: "citizen",
      ceilingDate: currentCeilingDate,
      isIllustrative: false,
    });

    expect(figures.retirementRate).toBe(0.3382);
    expect(figures.isRetirementAccount).toBe(true);
    expect(figures.selectedDistribution).toBeNull();
    expect(figures.routing).toMatchObject({
      selected: "undetermined",
      branches: {
        beforeFullRetirementSum: { OA: 960.16, RA: 919.9, MA: 839.94 },
        afterFullRetirementSum: { OA: 1880.06, RA: 0, MA: 839.94 },
      },
    });
    expect(figures.warnings).toContainEqual(
      expect.objectContaining({ code: "routing-context-required" }),
    );
  });

  it("reports effective low-wage rates separately from nominal schedule rates", () => {
    const figures = buildFigures({
      income: 600,
      age: 30,
      ageGroup: findAgeGroup(30),
      citizenship: "citizen",
      ceilingDate: currentCeilingDate,
      isIllustrative: false,
    });

    expect(figures.wageBand).toBe("phased-employee-share");
    expect(figures.employee).toBe(60);
    expect(figures.employer).toBe(102);
    expect(figures.employeeRate).toBe(0.1);
    expect(figures.employerRate).toBe(0.17);
    expect(figures.totalRate).toBe(0.27);
    expect(figures.nominalEmployeeRate).toBe(0.2);
    expect(figures.nominalEmployerRate).toBe(0.17);
    expect(figures.wageBandDescription).toContain("phases in");
  });

  it("preserves half-percentage contribution rates", () => {
    expect(formatRate(0.125)).toBe("12.5%");
    expect(formatRate(0.075)).toBe("7.5%");
    expect(formatRate(0.145)).toBe("14.5%");
  });
});
