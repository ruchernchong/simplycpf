import {
  CPF_QUARTERLY_INTEREST_RATES,
  CPF_SMRA_PEGGED_RATE_MARKUP,
  type OfficialQuarterlyCpfInterestRate,
  CPF_INTEREST_FLOOR_RATES as POLICY_INTEREST_FLOOR_RATES,
  CPF_INTEREST_RATE_METHODOLOGY as POLICY_INTEREST_RATE_METHODOLOGY,
} from "@/policy";

/** Compatibility adapter; authoritative values live in `src/policy`. */
export const CPF_INTEREST_FLOOR_RATES = POLICY_INTEREST_FLOOR_RATES;

/** Compatibility adapter; authoritative values live in `src/policy`. */
export const PEGGED_RATE_MARKUP = CPF_SMRA_PEGGED_RATE_MARKUP;

/**
 * Retains the historical OA/SMRA keys for callers while exposing the
 * canonical structured methodology alongside them.
 */
export const CPF_INTEREST_RATE_METHODOLOGY = {
  OA: {
    description: `${POLICY_INTEREST_RATE_METHODOLOGY.ordinaryAccount.peg}, subject to the ${POLICY_INTEREST_RATE_METHODOLOGY.ordinaryAccount.floorRate}% legislated floor.`,
    reviewFrequency:
      POLICY_INTEREST_RATE_METHODOLOGY.ordinaryAccount.reviewFrequency,
  },
  SMRA: {
    description: `${POLICY_INTEREST_RATE_METHODOLOGY.specialMediSaveRetirementAccounts.peg} plus ${POLICY_INTEREST_RATE_METHODOLOGY.specialMediSaveRetirementAccounts.markupPercentagePoints} percentage point, subject to the current ${POLICY_INTEREST_RATE_METHODOLOGY.specialMediSaveRetirementAccounts.floorRate}% floor.`,
    reviewFrequency:
      POLICY_INTEREST_RATE_METHODOLOGY.specialMediSaveRetirementAccounts
        .reviewFrequency,
  },
  sourceUrl: POLICY_INTEREST_RATE_METHODOLOGY.sourceUrls[1],
  verifiedAt: POLICY_INTEREST_RATE_METHODOLOGY.verifiedAt,
  status: POLICY_INTEREST_RATE_METHODOLOGY.status,
  ordinaryAccount: POLICY_INTEREST_RATE_METHODOLOGY.ordinaryAccount,
  specialMediSaveRetirementAccounts:
    POLICY_INTEREST_RATE_METHODOLOGY.specialMediSaveRetirementAccounts,
} as const;

export const CPF_ACCOUNT_INTEREST_MAP: Record<string, string> = {
  OA: "Ordinary Account (OA)",
  SA: "Special Account (SA)",
  MA: "MediSave Account (MA)",
  RA: "Retirement Account (RA)",
  SMRA: "Special, MediSave & Retirement Accounts",
};

export type OfficialQuarterlyCpfRate = OfficialQuarterlyCpfInterestRate;

/** Compatibility alias for the canonical official quarterly declarations. */
export const QUARTERLY_CPF_RATES = CPF_QUARTERLY_INTEREST_RATES;
