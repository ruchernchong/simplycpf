import { CPF_CONTRIBUTION_SCHEDULES, CPF_WAGE_RULES } from "./contributions";
import {
  CPF_POLICY_VERIFIED_AT,
  POLICY_METADATA,
  POLICY_SOURCES,
} from "./sources";

/**
 * Small statutory rules that used to be repeated in page copy and tools.
 * Values here are policy facts; product assumptions belong with the result
 * that uses them and must not be added to this object.
 */
export const CPF_POLICY_RULES = {
  wageBands: CPF_WAGE_RULES,
  lifecycleAges: {
    retirementAccountCreated: 55,
    specialAccountClosed: 55,
    cpfLifePayoutEligibility: 65,
    latestCpfLifePayoutStart: 70,
  },
  specialAccountClosure: {
    effectiveDate: "2025-01-19",
    appliesFromAge: 55,
    routeToRetirementAccountUntil: "FRS",
    routeRemainderTo: "OA",
  },
  retirementTopUps: {
    taxRelief: {
      selfAnnualCap: 8000,
      familyAnnualCap: 8000,
      combinedAnnualCap: 16000,
    },
    actualCapacity: {
      below55Account: "SA",
      below55Limit: "current FRS less qualifying retirement savings",
      from55Account: "RA",
      from55Limit: "current ERS less qualifying retirement savings",
    },
    matchedRetirementSavingsScheme: {
      annualMatchingGrantCap: 2000,
      lifetimeMatchingGrantCap: 20000,
      qualifyingTopUpsDoNotReceiveTaxRelief: true,
    },
  },
  extraInterest: {
    combinedBalanceCap: 60000,
    ordinaryAccountCap: 20000,
    accountPriority: ["RA", "OA", "SA", "MA"],
    below55: {
      extraPercentagePoints: 1,
      balanceCap: 60000,
      oaExtraInterestCreditedTo: "SA",
    },
    age55AndAbove: {
      firstTier: { balanceCap: 30000, extraPercentagePoints: 2 },
      secondTier: { balanceCap: 30000, extraPercentagePoints: 1 },
      oaExtraInterestCreditedTo: "RA",
    },
  },
  statutoryEmploymentAges: {
    effectiveDate: "2026-07-01",
    retirementAge: 64,
    reEmploymentAge: 69,
    cohorts: [
      {
        bornFrom: "1958-07-01",
        bornTo: "1960-06-30",
        retirementAge: 62,
        reEmploymentAge: 69,
      },
      {
        bornFrom: "1960-07-01",
        bornTo: "1963-06-30",
        retirementAge: 63,
        reEmploymentAge: 69,
      },
      {
        bornFrom: "1963-07-01",
        retirementAge: 64,
        reEmploymentAge: 69,
      },
    ],
  },
} as const;

/** Single import target for official policy data and provenance. */
export const CPF_POLICY_CATALOGUE = {
  version: CPF_POLICY_VERIFIED_AT,
  verifiedAt: CPF_POLICY_VERIFIED_AT,
  sources: POLICY_SOURCES,
  metadata: POLICY_METADATA,
  rules: CPF_POLICY_RULES,
  contributionSchedules: CPF_CONTRIBUTION_SCHEDULES,
} as const;
