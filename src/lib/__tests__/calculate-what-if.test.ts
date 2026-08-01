import { describe, expect, it } from "vitest";
import {
  calculateAgeComparisonScenario,
  calculateRetirementTransferScenario,
  calculateSalaryChangeScenario,
  calculateVoluntaryTopUpScenario,
} from "@/lib/calculate-what-if";
import type { ProjectionParams } from "@/types";

const baseProjection: ProjectionParams = {
  monthlyIncome: 5000,
  birthDate: "01/1995",
  startAge: 30,
  endAge: 65,
  initialBalances: { oa: 10000, sa: 5000, ma: 5000, ra: 0 },
  citizenship: "citizen",
};

describe("calculateSalaryChangeScenario", () => {
  it("should improve age 65 outcomes when income rises", () => {
    const result = calculateSalaryChangeScenario({
      projection: baseProjection,
      newMonthlyIncome: 6500,
    });

    expect(result.scenario.totalContributed).toBeGreaterThan(
      result.baseline.totalContributed,
    );
    expect(result.difference.age65Balance).toBeGreaterThan(0);
    expect(result.insights).toHaveLength(3);
    expect(result.insights.join(" ")).not.toMatch(/estimate could rise/i);
  });

  it("should show lower outcomes when income falls", () => {
    const result = calculateSalaryChangeScenario({
      projection: baseProjection,
      newMonthlyIncome: 4000,
    });

    expect(result.difference.totalContributions).toBeLessThan(0);
    expect(result.difference.age65Balance).toBeLessThan(0);
  });
});

describe("calculateRetirementTransferScenario", () => {
  it("should improve interest and projected balances after a retirement transfer", () => {
    const result = calculateRetirementTransferScenario({
      projection: baseProjection,
      transferAmount: 10000,
      timing: "now",
    });

    expect(result.difference.totalInterestEarned).toBeGreaterThan(0);
    expect(result.difference.age65Balance).toBeGreaterThan(0);
    expect(result.insights[0]).toContain("OA");
  });
});

describe("calculateVoluntaryTopUpScenario", () => {
  it("should improve projected balances after annual top-ups", () => {
    const result = calculateVoluntaryTopUpScenario({
      projection: baseProjection,
      amount: 8000,
      account: "SA",
    });

    expect(result.difference.totalInterestEarned).toBeGreaterThan(0);
    expect(result.difference.age65Balance).toBeGreaterThan(0);
    expect(result.insights[1]).toContain("tax relief");
  });
});

describe("calculateAgeComparisonScenario", () => {
  it("should show the cost of delaying CPF contributions", () => {
    const result = calculateAgeComparisonScenario({
      monthlyIncome: 5000,
      endAge: 65,
      citizenship: "citizen",
      baselineStartAge: 25,
      scenarioStartAge: 35,
    });

    expect(result.difference.totalContributions).toBeLessThan(0);
    expect(result.difference.age65Balance).toBeLessThan(0);
    expect(result.insights[0]).toContain("less by age 65");
  });

  it("should show a higher outcome when the scenario starts earlier", () => {
    const result = calculateAgeComparisonScenario({
      monthlyIncome: 5000,
      endAge: 65,
      citizenship: "citizen",
      baselineStartAge: 35,
      scenarioStartAge: 25,
    });

    expect(result.difference.age65Balance).toBeGreaterThan(0);
    expect(result.insights[0]).toContain("more by age 65");
  });
});
