import { describe, expect, it } from "vitest";
import {
  calculateCompoundGrowth,
  createInvestmentScenarios,
} from "@/components/investments/investment-assumptions";

describe("createInvestmentScenarios", () => {
  it("keeps only CPF floor rates as official presets", () => {
    const scenarios = createInvestmentScenarios(6.25);

    expect(scenarios.filter(({ basis }) => basis === "official")).toEqual([
      {
        id: "cpf-oa",
        name: "CPF OA floor",
        rate: 2.5,
        basis: "official",
      },
      {
        id: "cpf-smra",
        name: "CPF SMRA floor",
        rate: 4,
        basis: "official",
      },
    ]);
    expect(scenarios.find(({ basis }) => basis === "assumed")?.rate).toBe(6.25);
  });

  it("allows a loss assumption but not a return below -100%", () => {
    expect(createInvestmentScenarios(-15).at(-1)?.rate).toBe(-15);
    expect(createInvestmentScenarios(-150).at(-1)?.rate).toBe(-100);
  });
});

describe("calculateCompoundGrowth", () => {
  it("compounds the supplied rate without treating it as a forecast", () => {
    expect(calculateCompoundGrowth(50_000, 5, 20)).toBeCloseTo(
      50_000 * 1.05 ** 20,
      6,
    );
    expect(calculateCompoundGrowth(50_000, -100, 1)).toBe(0);
  });
});
