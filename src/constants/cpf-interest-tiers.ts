import { CPF_POLICY_RULES } from "@/policy";

/** Compatibility adapters; authoritative values live in `src/policy`. */
export const CPF_EXTRA_INTEREST_CAP =
  CPF_POLICY_RULES.extraInterest.combinedBalanceCap;
export const CPF_OA_EXTRA_INTEREST_CAP =
  CPF_POLICY_RULES.extraInterest.ordinaryAccountCap;
export const CPF_EXTRA_INTEREST_RATE =
  CPF_POLICY_RULES.extraInterest.below55.extraPercentagePoints / 100;
export const CPF_ADDITIONAL_SENIOR_INTEREST_CAP =
  CPF_POLICY_RULES.extraInterest.age55AndAbove.firstTier.balanceCap;
