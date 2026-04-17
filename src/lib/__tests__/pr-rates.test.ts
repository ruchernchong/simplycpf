import { describe, expect, it } from "vitest";
import { prYear1Rates, prYear2Rates } from "@/data/pr-rates";

describe("PR Year 1 Rates", () => {
  it("should have age groups for 1st year SPRs", () => {
    expect(prYear1Rates.length).toBeGreaterThan(0);
  });

  it("should have lower contribution rates than citizen rates for age 55 and below", () => {
    const under55 = prYear1Rates.filter((g) => g.minAge === 0)[0];
    expect(under55).toBeDefined();
    expect(under55.contributionRate.employee).toBeLessThan(0.2);
    expect(under55.contributionRate.employer).toBeLessThan(0.17);
  });

  it("should distribute entirely to OA for 1st year SPRs", () => {
    const under55 = prYear1Rates.filter((g) => g.minAge === 0)[0];
    expect(under55).toBeDefined();
    expect(under55.distributionRate.OA).toBe(1);
    expect(under55.distributionRate.SA).toBe(0);
    expect(under55.distributionRate.MA).toBe(0);
  });
});

describe("PR Year 2 Rates", () => {
  it("should have age groups for 2nd year SPRs", () => {
    expect(prYear2Rates.length).toBeGreaterThan(0);
  });

  it("should have higher employer rate than 1st year SPRs", () => {
    const pr1Under55 = prYear1Rates.filter((g) => g.minAge === 0)[0];
    const pr2Under55 = prYear2Rates.filter((g) => g.minAge === 0)[0];

    expect(pr2Under55.contributionRate.employer).toBeGreaterThan(
      pr1Under55.contributionRate.employer,
    );
  });

  it("should distribute across OA, SA, and MA for 2nd year SPRs", () => {
    const under55 = prYear2Rates.filter((g) => g.minAge === 0)[0];
    expect(under55).toBeDefined();
    expect(under55.distributionRate.OA).toBeGreaterThan(0);
    expect(under55.distributionRate.SA).toBeGreaterThan(0);
    expect(under55.distributionRate.MA).toBeGreaterThan(0);
  });
});
