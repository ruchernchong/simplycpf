import { describe, expect, it } from "vitest";
import {
  permanentResidentYear1Rates,
  permanentResidentYear2Rates,
} from "@/data/permanent-resident-rates";

describe("Permanent Resident Year 1 Rates", () => {
  it("should have age groups for 1st year SPRs", () => {
    expect(permanentResidentYear1Rates.length).toBeGreaterThan(0);
  });

  it("should have lower contribution rates than citizen rates for age 55 and below", () => {
    const under55 = permanentResidentYear1Rates.filter(
      (g) => g.minAge === 0,
    )[0];
    expect(under55).toBeDefined();
    expect(under55.contributionRate.employee).toBeLessThan(0.2);
    expect(under55.contributionRate.employer).toBeLessThan(0.17);
  });

  it("should distribute across OA, SA, and MA based on age allocation", () => {
    const under35 = permanentResidentYear1Rates.filter(
      (g) => g.minAge === 0,
    )[0];
    expect(under35).toBeDefined();
    expect(under35.distributionRate.OA).toBeGreaterThan(0);
    expect(under35.distributionRate.SA).toBeGreaterThan(0);
    expect(under35.distributionRate.MA).toBeGreaterThan(0);
  });
});

describe("Permanent Resident Year 2 Rates", () => {
  it("should have age groups for 2nd year SPRs", () => {
    expect(permanentResidentYear2Rates.length).toBeGreaterThan(0);
  });

  it("should have higher employer rate than 1st year SPRs", () => {
    const year1Under55 = permanentResidentYear1Rates.filter(
      (g) => g.minAge === 0,
    )[0];
    const year2Under55 = permanentResidentYear2Rates.filter(
      (g) => g.minAge === 0,
    )[0];

    expect(year2Under55.contributionRate.employer).toBeGreaterThan(
      year1Under55.contributionRate.employer,
    );
  });

  it("should distribute across OA, SA, and MA for 2nd year SPRs", () => {
    const under35 = permanentResidentYear2Rates.filter(
      (g) => g.minAge === 0,
    )[0];
    expect(under35).toBeDefined();
    expect(under35.distributionRate.OA).toBeGreaterThan(0);
    expect(under35.distributionRate.SA).toBeGreaterThan(0);
    expect(under35.distributionRate.MA).toBeGreaterThan(0);
  });
});
