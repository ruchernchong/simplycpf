import {
  CPF_LIFE_2026_REFERENCE_ROWS,
  CPF_LIFE_POLICY,
  getPolicyMetadata,
  POLICY_SOURCES,
} from "@/policy";
import type { CpfLifeReference } from "@/types";

/** Earliest age monthly payouts can begin. */
export const CPF_LIFE_PAYOUT_ELIGIBILITY_AGE =
  CPF_LIFE_POLICY.payoutStart.earliestAge;

/** Latest age payouts can be deferred to. */
export const CPF_LIFE_LATEST_PAYOUT_AGE = CPF_LIFE_POLICY.payoutStart.latestAge;

/**
 * The published retirement-savings condition for automatic inclusion. It is
 * not a minimum joining balance or a zero-payout threshold.
 */
export const CPF_LIFE_AUTO_INCLUSION_BALANCE =
  CPF_LIFE_POLICY.automaticInclusion.minimumRetirementSavingsAtPayoutStart;

export const CPF_LIFE_REFERENCE_SOURCE_URL =
  POLICY_SOURCES.cpfLifeReferencePayouts.url;

export const CPF_LIFE_PERSONALISED_ESTIMATOR_URL =
  CPF_LIFE_POLICY.reference.personalisedEstimatorUrl;

/**
 * CPF Board's canonical reference table. These rows are displayed exactly;
 * they are never interpolated into a personalised payout estimate.
 */
export const CPF_LIFE_2026_REFERENCE: CpfLifeReference = {
  referenceYear: CPF_LIFE_POLICY.reference.year,
  plan: CPF_LIFE_POLICY.reference.plan,
  profile: CPF_LIFE_POLICY.reference.profile,
  policy: getPolicyMetadata("cpf-life-reference-payouts", {
    version: `${CPF_LIFE_POLICY.reference.year}-reference-table`,
    effectiveFrom: `${CPF_LIFE_POLICY.reference.year}-01-01`,
  }),
  rows: CPF_LIFE_2026_REFERENCE_ROWS.map((row) => ({
    raAt55: row.raAt55,
    raAt65: row.raAt65,
    monthlyPayoutAt65: row.monthlyPayoutAt65,
    monthlyPayoutAt70: row.monthlyPayoutAt70,
    ...(row.label ? { label: row.label } : {}),
  })),
  sourceUrl: CPF_LIFE_REFERENCE_SOURCE_URL,
  personalisedEstimatorUrl: CPF_LIFE_PERSONALISED_ESTIMATOR_URL,
  verifiedAt: CPF_LIFE_POLICY.verifiedAt,
  note: CPF_LIFE_POLICY.reference.note,
};
