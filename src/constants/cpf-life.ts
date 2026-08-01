import { POLICY_SOURCES } from "@/policy";
import type { CpfLifeReference } from "@/types";

/** Earliest age monthly payouts can begin. */
export const CPF_LIFE_PAYOUT_ELIGIBILITY_AGE = 65;

/** Latest age payouts can be deferred to. */
export const CPF_LIFE_LATEST_PAYOUT_AGE = 70;

/**
 * One of CPF LIFE's automatic-inclusion conditions for members born in 1958
 * or later. It is not a minimum joining balance or a zero-payout threshold.
 */
export const CPF_LIFE_AUTO_INCLUSION_BALANCE = 60_000;

export const CPF_LIFE_REFERENCE_SOURCE_URL =
  POLICY_SOURCES.cpfLifeReferencePayouts.url;

export const CPF_LIFE_PERSONALISED_ESTIMATOR_URL =
  "https://www.cpf.gov.sg/member/retirement-income/about-cpf-planner-retirement-income";

/**
 * CPF Board's 2026 reference table for a male member on the Standard Plan.
 * These rows are displayed exactly; they are never interpolated into a
 * personalised payout estimate.
 */
export const CPF_LIFE_2026_REFERENCE: CpfLifeReference = {
  referenceYear: 2026,
  plan: "Standard",
  profile: "male",
  rows: [
    {
      raAt55: 50_000,
      raAt65: 82_400,
      monthlyPayoutAt65: 490,
      monthlyPayoutAt70: 670,
    },
    {
      raAt55: 110_200,
      raAt65: 170_100,
      monthlyPayoutAt65: 950,
      monthlyPayoutAt70: 1_280,
      label: "2026 Basic Retirement Sum",
    },
    {
      raAt55: 150_000,
      raAt65: 227_900,
      monthlyPayoutAt65: 1_250,
      monthlyPayoutAt70: 1_670,
    },
    {
      raAt55: 220_400,
      raAt65: 330_100,
      monthlyPayoutAt65: 1_780,
      monthlyPayoutAt70: 2_380,
      label: "2026 Full Retirement Sum",
    },
    {
      raAt55: 300_000,
      raAt65: 445_600,
      monthlyPayoutAt65: 2_380,
      monthlyPayoutAt70: 3_170,
    },
    {
      raAt55: 440_800,
      raAt65: 650_100,
      monthlyPayoutAt65: 3_440,
      monthlyPayoutAt70: 4_580,
      label: "2026 Enhanced Retirement Sum",
    },
  ],
  sourceUrl: CPF_LIFE_REFERENCE_SOURCE_URL,
  personalisedEstimatorUrl: CPF_LIFE_PERSONALISED_ESTIMATOR_URL,
  verifiedAt: "2026-08-01",
  note: "CPF Board reference figures for a male member on the CPF LIFE Standard Plan. Actual payouts depend on individual circumstances and prevailing parameters.",
};
