import { describe, expect, it } from "vitest";
import {
  CPF_CONTRIBUTION_SCHEDULES,
  CPF_POLICY_CATALOGUE,
  CPF_POLICY_RULES,
  POLICY_METADATA,
} from "@/policy";

describe("CPF policy catalogue", () => {
  it("provides first-party provenance for every registered dataset", () => {
    for (const metadata of Object.values(POLICY_METADATA)) {
      expect(metadata.verifiedAt).toBe("2026-08-01");
      expect(metadata.status).toBe("official");
      expect(metadata.sources.length).toBeGreaterThan(0);
      for (const source of metadata.sources) {
        expect(source.url).toMatch(
          /^https:\/\/(?:www\.)?(?:cpf\.gov\.sg|iras\.gov\.sg|mom\.gov\.sg)\//,
        );
      }
    }
  });

  it("is versioned and aggregates schedules, metadata, sources and small rules", () => {
    expect(CPF_POLICY_CATALOGUE.version).toBe("2026-08-01");
    expect(CPF_POLICY_CATALOGUE.contributionSchedules).toBe(
      CPF_CONTRIBUTION_SCHEDULES,
    );
    expect(CPF_POLICY_CATALOGUE.rules).toBe(CPF_POLICY_RULES);
    expect(CPF_POLICY_RULES.wageBands).toEqual({
      noContributionAtOrBelow: 50,
      employerOnlyAtOrBelow: 500,
      phasedEmployeeShareAtOrBelow: 750,
      fullRatesAbove: 750,
      annualAdditionalWageCeiling: 102000,
    });
  });

  it("contains complete, non-overlapping official schedules through 2027", () => {
    expect(
      CPF_CONTRIBUTION_SCHEDULES.map((schedule) => [
        schedule.effectiveFrom,
        schedule.effectiveTo,
      ]),
    ).toEqual([
      ["2023-01-01", "2023-08-31"],
      ["2023-09-01", "2023-12-31"],
      ["2024-01-01", "2024-12-31"],
      ["2025-01-01", "2025-12-31"],
      ["2026-01-01", "2026-12-31"],
      ["2027-01-01", "2027-12-31"],
    ]);

    for (const schedule of CPF_CONTRIBUTION_SCHEDULES) {
      expect(schedule.citizenRates).toHaveLength(5);
      expect(schedule.sprYear1Rates).toHaveLength(5);
      expect(schedule.sprYear2Rates).toHaveLength(5);
      expect(schedule.allocationRates).toHaveLength(8);
      for (const allocation of schedule.allocationRates) {
        expect(
          allocation.oaBasisPoints +
            allocation.retirementBasisPoints +
            allocation.maBasisPoints,
        ).toBe(10000);
      }
      expect(schedule.contributionMetadata.sources[0]?.url).toMatch(/\.pdf$/);
      expect(schedule.allocationMetadata.sources[0]?.url).toMatch(/\.pdf$/);
    }
  });
});
