import { getAgeGroupsForMonth } from "@/data";
import type { AgeGroup } from "@/types";

/**
 * Current G/G rates for first-year SPRs. The canonical table and provenance
 * are maintained in `src/policy/contributions.ts`.
 */
export const permanentResidentYear1Rates: AgeGroup[] = getAgeGroupsForMonth(
  "2026-01",
  "spr-year1",
);

/**
 * Current G/G rates for second-year SPRs. The canonical table and provenance
 * are maintained in `src/policy/contributions.ts`.
 */
export const permanentResidentYear2Rates: AgeGroup[] = getAgeGroupsForMonth(
  "2026-01",
  "spr-year2",
);
