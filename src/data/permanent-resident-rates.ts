import { getAgeGroupsForMonth } from "@/data";
import { CPF_POLICY_CATALOGUE } from "@/policy";
import type { AgeGroup } from "@/types";

/**
 * Current G/G rates for first-year SPRs. The canonical table and provenance
 * are maintained in `src/policy/contributions.ts`.
 */
export const permanentResidentYear1Rates: AgeGroup[] = getAgeGroupsForMonth(
  CPF_POLICY_CATALOGUE.metadata["cpf-contribution-rates"].verifiedAt,
  "spr-year1",
);

/**
 * Current G/G rates for second-year SPRs. The canonical table and provenance
 * are maintained in `src/policy/contributions.ts`.
 */
export const permanentResidentYear2Rates: AgeGroup[] = getAgeGroupsForMonth(
  CPF_POLICY_CATALOGUE.metadata["cpf-contribution-rates"].verifiedAt,
  "spr-year2",
);
