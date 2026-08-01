export type PolicyStatus = "official" | "assumed";

export type PolicyDatasetId =
  | "cpf-contribution-rates"
  | "cpf-allocation-rates"
  | "cpf-wage-ceilings"
  | "cpf-basic-healthcare-sum"
  | "cpf-retirement-sums"
  | "cpf-interest-rates"
  | "cpf-extra-interest"
  | "cpf-special-account-closure"
  | "cpf-life-reference-payouts"
  | "cpf-retirement-top-ups"
  | "cpf-housing-refunds"
  | "iras-cpf-cash-top-up-relief"
  | "mom-retirement-re-employment-ages";

export interface PolicySource {
  id: string;
  agency: "CPF Board" | "IRAS" | "MOM";
  title: string;
  url: string;
}

/**
 * Provenance attached to every policy-backed dataset or result.
 *
 * Dates use ISO calendar dates. A projection may copy an official policy
 * beyond its published end date, but it must replace `status` with `assumed`
 * and explain the freeze in `notes`.
 */
export interface PolicyMetadata {
  dataset: PolicyDatasetId;
  label: string;
  version: string;
  status: PolicyStatus;
  effectiveFrom: string;
  effectiveTo?: string;
  verifiedAt: string;
  sources: readonly PolicySource[];
  scope?: string;
  notes?: readonly string[];
}
