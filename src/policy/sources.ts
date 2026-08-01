import type {
  PolicyDatasetId,
  PolicyMetadata,
  PolicySource,
  PolicyStatus,
} from "./types";

export const POLICY_SOURCES = {
  contributionCurrent: {
    id: "cpf-contribution-current",
    agency: "CPF Board",
    title: "How much CPF contributions to pay",
    url: "https://www.cpf.gov.sg/employer/employer-obligations/how-much-cpf-contributions-to-pay",
  },
  contributionCalculator: {
    id: "cpf-contribution-calculator",
    agency: "CPF Board",
    title: "CPF contribution calculator",
    url: "https://www.cpf.gov.sg/employer/tools-and-services/calculators/cpf-contribution-calculator",
  },
  contributionRounding: {
    id: "cpf-contribution-rounding",
    agency: "CPF Board",
    title: "Are CPF contributions rounded to the nearest dollar?",
    url: "https://www.cpf.gov.sg/service/article/are-cpf-contributions-rounded-to-the-nearest-dollar",
  },
  contributionPast: {
    id: "cpf-contribution-past",
    agency: "CPF Board",
    title: "Past CPF contribution and allocation rates",
    url: "https://www.cpf.gov.sg/employer/employer-obligations/how-much-cpf-contributions-to-pay/past-cpf-contribution-and-allocation-rates",
  },
  contribution2027: {
    id: "cpf-contribution-2027",
    agency: "CPF Board",
    title: "CPF Contribution Changes from 1 January 2027",
    url: "https://www.cpf.gov.sg/employer/infohub/news/cpf-related-announcements/new-contribution-rates",
  },
  contributionRates2023Jan: {
    id: "cpf-contribution-rates-2023-jan",
    agency: "CPF Board",
    title: "CPF contribution and allocation rates from 1 January 2023",
    url: "https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPFcontributionandallocationratesfrom1January2023.pdf",
  },
  contributionRates2023Sep: {
    id: "cpf-contribution-rates-2023-sep",
    agency: "CPF Board",
    title: "CPF contribution and allocation rates from 1 September 2023",
    url: "https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPF%20contribution%20rates%20from%201%20Sep%202023.pdf",
  },
  contributionRates2024: {
    id: "cpf-contribution-rates-2024",
    agency: "CPF Board",
    title: "CPF contribution and allocation rates from 1 January 2024",
    url: "https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPFcontributionandallocationratesfrom1Jan2024.pdf",
  },
  contributionRates2025: {
    id: "cpf-contribution-rates-2025",
    agency: "CPF Board",
    title: "CPF contribution and allocation rates from 1 January 2025",
    url: "https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/jan2025_contributionandallocationrates.pdf",
  },
  contributionRates2026: {
    id: "cpf-contribution-rates-2026",
    agency: "CPF Board",
    title: "CPF contribution rates from 1 January 2026",
    url: "https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPFcontributionratesfrom1Jan2026.pdf",
  },
  allocationRates2026: {
    id: "cpf-allocation-rates-2026",
    agency: "CPF Board",
    title: "CPF allocation rates from 1 January 2026",
    url: "https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPFAllocationRatesfromJanuary2026.pdf",
  },
  contributionRates2027: {
    id: "cpf-contribution-rates-2027",
    agency: "CPF Board",
    title: "CPF contribution rates from 1 January 2027",
    url: "https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/jan2027cpfcontributionrates.pdf",
  },
  allocationRates2027: {
    id: "cpf-allocation-rates-2027",
    agency: "CPF Board",
    title: "CPF allocation rates from 1 January 2027",
    url: "https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/jan2027cpfallocationrates.pdf",
  },
  ordinaryWageCeiling: {
    id: "cpf-ordinary-wage-ceiling",
    agency: "CPF Board",
    title: "What is the Ordinary Wage ceiling?",
    url: "https://www.cpf.gov.sg/service/article/what-is-the-ordinary-wage-ow-ceiling",
  },
  additionalWageCeiling: {
    id: "cpf-additional-wage-ceiling",
    agency: "CPF Board",
    title: "What is the Additional Wage ceiling?",
    url: "https://www.cpf.gov.sg/service/article/what-is-the-additional-wage-aw-ceiling",
  },
  additionalWageCeilingEstimation: {
    id: "cpf-additional-wage-ceiling-estimation",
    agency: "CPF Board",
    title: "Calculating CPF contributions on Additional Wages before year end",
    url: "https://www.cpf.gov.sg/service/article/how-do-i-calculate-cpf-contributions-on-additional-wages-aw-paid-before-the-end-of-the-year-last-month-of-employment",
  },
  ageGroupTransition: {
    id: "cpf-age-group-transition",
    agency: "CPF Board",
    title:
      "Which CPF contribution rate applies when an employee enters the next age group?",
    url: "https://www.cpf.gov.sg/service/article/which-cpf-contribution-rate-should-be-applied-when-my-employee-enters-the-next-age-group",
  },
  sprYearTransition: {
    id: "cpf-spr-year-transition",
    agency: "CPF Board",
    title:
      "CPF contribution years for an employee who recently obtained SPR status",
    url: "https://www.cpf.gov.sg/service/article/do-i-need-to-pay-cpf-contributions-for-my-foreign-employee-who-has-recently-obtained-singapore-permanent-residence-status",
  },
  allocationTransition: {
    id: "cpf-allocation-transition",
    agency: "CPF Board",
    title: "How are CPF contributions allocated to CPF accounts?",
    url: "https://www.cpf.gov.sg/service/article/how-are-my-cpf-contributions-allocated-to-my-cpf-accounts",
  },
  post55ContributionRouting: {
    id: "cpf-post-55-contribution-routing",
    agency: "CPF Board",
    title:
      "Allocation of CPF contributions after age 55 and Special Account closure",
    url: "https://www.cpf.gov.sg/service/article/which-accounts-will-my-cpf-contributions-be-allocated-to-after-i-turn-age-55-and-my-special-account-is-closed",
  },
  basicHealthcareSum: {
    id: "cpf-basic-healthcare-sum",
    agency: "CPF Board",
    title: "What is the Basic Healthcare Sum?",
    url: "https://www.cpf.gov.sg/service/article/what-is-the-basic-healthcare-sum",
  },
  basicHealthcareSumOverflow: {
    id: "cpf-basic-healthcare-sum-overflow",
    agency: "CPF Board",
    title: "What happens to MediSave savings above the Basic Healthcare Sum?",
    url: "https://www.cpf.gov.sg/service/article/i-have-saved-the-basic-healthcare-sum-bhs-in-my-medisave-account-what-happens-to-the-savings-in-my-ma-above-the-bhs",
  },
  medisaveTopUpLimit: {
    id: "cpf-medisave-top-up-limit",
    agency: "CPF Board",
    title:
      "Differences between retirement, housing, MediSave and three-account top-ups",
    url: "https://www.cpf.gov.sg/service/article/what-are-the-differences-between-topping-up-my-retirement-savings-making-a-voluntary-housing-refund-topping-up-my-medisave-account-and-topping-up-my-three-cpf-accounts",
  },
  retirementSums: {
    id: "cpf-retirement-sums",
    agency: "CPF Board",
    title: "What is the CPF retirement sum?",
    url: "https://www.cpf.gov.sg/member/infohub/educational-resources/what-is-the-cpf-retirement-sum",
  },
  historicalFullRetirementSums: {
    id: "cpf-historical-full-retirement-sums",
    agency: "CPF Board",
    title: "Full Retirement Sum by 55th birthday",
    url: "https://www.cpf.gov.sg/content/dam/web/member/retirement-income/documents/RetirementSum.pdf",
  },
  retirementSums2023To2027: {
    id: "cpf-retirement-sums-2023-to-2027",
    agency: "CPF Board",
    title: "Budget Highlights 2022",
    url: "https://www.cpf.gov.sg/member/infohub/news/cpf-related-announcements/budget-highlights-2022",
  },
  interest: {
    id: "cpf-interest",
    agency: "CPF Board",
    title: "Earning attractive interest",
    url: "https://www.cpf.gov.sg/member/growing-your-savings/earning-higher-returns/earning-attractive-interest",
  },
  interestMethodology: {
    id: "cpf-interest-methodology",
    agency: "CPF Board",
    title: "How are CPF interest rates determined?",
    url: "https://www.cpf.gov.sg/service/article/how-are-cpf-interest-rates-determined",
  },
  interestCrediting: {
    id: "cpf-interest-computation-crediting",
    agency: "CPF Board",
    title: "How is my CPF interest computed and credited into my accounts?",
    url: "https://www.cpf.gov.sg/service/article/how-is-my-cpf-interest-computed-and-credited-into-my-accounts",
  },
  interestTransferTiming: {
    id: "cpf-interest-transfer-timing",
    agency: "CPF Board",
    title:
      "When will top-ups received in my Special or Retirement Account start to earn interest?",
    url: "https://www.cpf.gov.sg/service/article/when-will-the-top-ups-received-in-my-cpf-special-retirement-account-start-to-earn-interest",
  },
  specialAccountClosureInterest: {
    id: "cpf-special-account-closure-interest",
    agency: "CPF Board",
    title: "Interest on SA savings transferred when the SA closes at age 55",
    url: "https://www.cpf.gov.sg/service/article/how-much-interest-will-i-earn-on-the-special-account-sa-savings-that-are-transferred-to-my-retirement-account-and-ordinary-account-upon-the-closure-of-my-sa-when-i-turn-55",
  },
  extraInterest: {
    id: "cpf-extra-interest",
    agency: "CPF Board",
    title: "How much extra interest can I earn on my CPF savings?",
    url: "https://www.cpf.gov.sg/service/article/how-much-extra-interest-can-i-earn-on-my-cpf-savings",
  },
  specialAccountClosure: {
    id: "cpf-special-account-closure",
    agency: "CPF Board",
    title: "Closure of Special Account for members aged 55 and above",
    url: "https://www.cpf.gov.sg/service/article/what-is-the-closure-of-special-account-for-members-aged-55-and-above-about",
  },
  reachingAge55: {
    id: "cpf-reaching-age-55",
    agency: "CPF Board",
    title: "Reaching age 55",
    url: "https://www.cpf.gov.sg/member/retirement-income/milestones/reaching-age-55",
  },
  age55PropertyWithdrawal: {
    id: "cpf-age-55-property-withdrawal",
    agency: "CPF Board",
    title:
      "Using a mixture of property and cash to set aside the Full Retirement Sum",
    url: "https://www.cpf.gov.sg/service/article/what-conditions-do-i-have-to-meet-to-set-aside-my-full-retirement-sum-with-a-mixture-of-property-and-cash-and-withdraw-part-of-my-retirement-account-savings-using-my-property",
  },
  retirementWithdrawals: {
    id: "cpf-retirement-withdrawals",
    agency: "CPF Board",
    title: "Withdrawing for immediate retirement needs",
    url: "https://www.cpf.gov.sg/member/retirement-income/retirement-withdrawals/withdrawing-for-immediate-retirement-needs",
  },
  withdrawalCohorts: {
    id: "cpf-withdrawal-cohorts",
    agency: "CPF Board",
    title: "Unconditional withdrawals based on birth year",
    url: "https://www.cpf.gov.sg/wdlamt",
  },
  age65Withdrawals: {
    id: "cpf-age-65-withdrawals",
    agency: "CPF Board",
    title: "How much CPF savings can I withdraw from age 65?",
    url: "https://www.cpf.gov.sg/service/article/how-much-cpf-savings-can-i-withdraw-from-age-65",
  },
  cpfLife: {
    id: "cpf-life",
    agency: "CPF Board",
    title: "CPF LIFE",
    url: "https://www.cpf.gov.sg/member/retirement-income/monthly-payouts/cpf-life",
  },
  cpfLifeReferencePayouts: {
    id: "cpf-life-reference-payouts",
    agency: "CPF Board",
    title: "How much CPF payouts can I get every month?",
    url: "https://www.cpf.gov.sg/service/article/how-much-cpf-payouts-can-i-get-every-month",
  },
  cpfLifeEligibility: {
    id: "cpf-life-eligibility",
    agency: "CPF Board",
    title: "Who can join CPF LIFE?",
    url: "https://www.cpf.gov.sg/service/article/who-can-join-cpf-life",
  },
  retirementTopUps: {
    id: "cpf-retirement-top-ups",
    agency: "CPF Board",
    title: "Top up to enjoy higher retirement payouts",
    url: "https://www.cpf.gov.sg/member/growing-your-savings/saving-more-with-cpf/top-up-to-enjoy-higher-retirement-payouts",
  },
  recurringTransferTiming: {
    id: "cpf-recurring-transfer-timing",
    agency: "CPF Board",
    title: "When does my recurring CPF transfer take place?",
    url: "https://www.cpf.gov.sg/service/article/when-does-my-recurring-CPF-transfer-take-place",
  },
  matchedRetirementSavings: {
    id: "cpf-matched-retirement-savings",
    agency: "CPF Board",
    title: "Matching grant for retirement",
    url: "https://www.cpf.gov.sg/member/growing-your-savings/government-support/matching-grant-for-retirement",
  },
  housingRefunds: {
    id: "cpf-housing-refunds",
    agency: "CPF Board",
    title: "CPF refund when selling or transferring property",
    url: "https://www.cpf.gov.sg/member/home-ownership/using-your-cpf-to-buy-a-home/cpf-refund-when-selling-or-transferring-property",
  },
  irasCashTopUpRelief: {
    id: "iras-cpf-cash-top-up-relief",
    agency: "IRAS",
    title: "Central Provident Fund (CPF) Cash Top-up Relief",
    url: "https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-reliefs-rebates-and-deductions/tax-reliefs/central-provident-fund-%28cpf%29-cash-top-up-relief",
  },
  momRetirementAges: {
    id: "mom-retirement-re-employment-ages",
    agency: "MOM",
    title: "Responsible re-employment",
    url: "https://www.mom.gov.sg/employment-practices/re-employment",
  },
} as const satisfies Record<string, PolicySource>;

interface DatasetDescriptor {
  label: string;
  effectiveFrom: string;
  /** Date this individual dataset was last checked against its sources. */
  verifiedAt: string;
  sourceKeys: readonly (keyof typeof POLICY_SOURCES)[];
  scope?: string;
}

const DATASET_DESCRIPTORS: Record<PolicyDatasetId, DatasetDescriptor> = {
  "cpf-contribution-rates": {
    label: "CPF contribution rates",
    effectiveFrom: "2023-01-01",
    verifiedAt: "2026-08-01",
    sourceKeys: [
      "contributionPast",
      "contributionCurrent",
      "contribution2027",
      "contributionRounding",
      "ageGroupTransition",
      "sprYearTransition",
    ],
    scope:
      "Private-sector and non-pensionable employees who are Singapore Citizens or SPRs using default graduated rates.",
  },
  "cpf-allocation-rates": {
    label: "CPF contribution allocation rates",
    effectiveFrom: "2023-01-01",
    verifiedAt: "2026-08-01",
    sourceKeys: [
      "contributionPast",
      "contributionCurrent",
      "contribution2027",
      "allocationTransition",
      "post55ContributionRouting",
      "specialAccountClosure",
    ],
  },
  "cpf-wage-ceilings": {
    label: "CPF Ordinary and Additional Wage ceilings",
    effectiveFrom: "2023-01-01",
    verifiedAt: "2026-08-01",
    sourceKeys: [
      "ordinaryWageCeiling",
      "additionalWageCeiling",
      "additionalWageCeilingEstimation",
      "contributionPast",
      "contributionCurrent",
      "contribution2027",
    ],
  },
  "cpf-basic-healthcare-sum": {
    label: "Basic Healthcare Sum",
    effectiveFrom: "2016-01-01",
    verifiedAt: "2026-08-01",
    sourceKeys: [
      "basicHealthcareSum",
      "basicHealthcareSumOverflow",
      "medisaveTopUpLimit",
    ],
  },
  "cpf-retirement-sums": {
    label: "Basic, Full and Enhanced Retirement Sums",
    effectiveFrom: "1995-07-01",
    verifiedAt: "2026-08-01",
    sourceKeys: [
      "retirementSums",
      "historicalFullRetirementSums",
      "retirementSums2023To2027",
    ],
  },
  "cpf-interest-rates": {
    label: "CPF declared interest rates and interest pegs",
    effectiveFrom: "2023-01-01",
    verifiedAt: "2026-08-01",
    sourceKeys: [
      "interest",
      "interestMethodology",
      "interestCrediting",
      "interestTransferTiming",
      "specialAccountClosureInterest",
    ],
  },
  "cpf-extra-interest": {
    label: "CPF extra-interest tiers and priority order",
    effectiveFrom: "2016-01-01",
    verifiedAt: "2026-08-01",
    sourceKeys: ["extraInterest"],
  },
  "cpf-special-account-closure": {
    label: "Special Account closure and age-55 routing",
    effectiveFrom: "2025-01-19",
    verifiedAt: "2026-08-01",
    sourceKeys: [
      "specialAccountClosure",
      "specialAccountClosureInterest",
      "post55ContributionRouting",
      "reachingAge55",
      "age55PropertyWithdrawal",
    ],
  },
  "cpf-retirement-withdrawals": {
    label: "CPF retirement withdrawal qualifications",
    effectiveFrom: "2026-01-01",
    verifiedAt: "2026-08-01",
    sourceKeys: [
      "retirementWithdrawals",
      "withdrawalCohorts",
      "age55PropertyWithdrawal",
      "age65Withdrawals",
    ],
    scope:
      "Current withdrawal rules are cohort-dependent; the structured amounts below cover members born in 1958 or later.",
  },
  "cpf-life-reference-payouts": {
    label: "CPF LIFE eligibility and reference payouts",
    effectiveFrom: "2026-01-01",
    verifiedAt: "2026-08-01",
    sourceKeys: ["cpfLife", "cpfLifeReferencePayouts", "cpfLifeEligibility"],
  },
  "cpf-retirement-top-ups": {
    label: "CPF retirement top-up rules",
    effectiveFrom: "2026-01-01",
    verifiedAt: "2026-08-01",
    sourceKeys: [
      "retirementTopUps",
      "matchedRetirementSavings",
      "medisaveTopUpLimit",
      "recurringTransferTiming",
    ],
  },
  "cpf-housing-refunds": {
    label: "CPF housing refunds",
    effectiveFrom: "2026-01-01",
    verifiedAt: "2026-08-01",
    sourceKeys: ["housingRefunds"],
  },
  "iras-cpf-cash-top-up-relief": {
    label: "CPF Cash Top-up Relief",
    effectiveFrom: "2026-01-01",
    verifiedAt: "2026-08-01",
    sourceKeys: ["irasCashTopUpRelief"],
  },
  "mom-retirement-re-employment-ages": {
    label: "Statutory retirement and re-employment ages",
    effectiveFrom: "2026-07-01",
    verifiedAt: "2026-08-01",
    sourceKeys: ["momRetirementAges"],
  },
};

export interface PolicyMetadataOverrides {
  version?: string;
  status?: PolicyStatus;
  effectiveFrom?: string;
  effectiveTo?: string;
  verifiedAt?: string;
  notes?: readonly string[];
  sources?: readonly PolicySource[];
}

export function getPolicyMetadata(
  dataset: PolicyDatasetId,
  overrides: PolicyMetadataOverrides = {},
): PolicyMetadata {
  const descriptor = DATASET_DESCRIPTORS[dataset];
  const effectiveFrom = overrides.effectiveFrom ?? descriptor.effectiveFrom;

  return {
    dataset,
    label: descriptor.label,
    version: overrides.version ?? effectiveFrom.slice(0, 7),
    status: overrides.status ?? "official",
    effectiveFrom,
    ...(overrides.effectiveTo ? { effectiveTo: overrides.effectiveTo } : {}),
    verifiedAt: overrides.verifiedAt ?? descriptor.verifiedAt,
    sources:
      overrides.sources ??
      descriptor.sourceKeys.map((key) => POLICY_SOURCES[key]),
    ...(descriptor.scope ? { scope: descriptor.scope } : {}),
    ...(overrides.notes ? { notes: overrides.notes } : {}),
  };
}

export const POLICY_METADATA: Record<PolicyDatasetId, PolicyMetadata> = {
  "cpf-contribution-rates": getPolicyMetadata("cpf-contribution-rates"),
  "cpf-allocation-rates": getPolicyMetadata("cpf-allocation-rates"),
  "cpf-wage-ceilings": getPolicyMetadata("cpf-wage-ceilings"),
  "cpf-basic-healthcare-sum": getPolicyMetadata("cpf-basic-healthcare-sum"),
  "cpf-retirement-sums": getPolicyMetadata("cpf-retirement-sums"),
  "cpf-interest-rates": getPolicyMetadata("cpf-interest-rates"),
  "cpf-extra-interest": getPolicyMetadata("cpf-extra-interest"),
  "cpf-special-account-closure": getPolicyMetadata(
    "cpf-special-account-closure",
  ),
  "cpf-retirement-withdrawals": getPolicyMetadata("cpf-retirement-withdrawals"),
  "cpf-life-reference-payouts": getPolicyMetadata("cpf-life-reference-payouts"),
  "cpf-retirement-top-ups": getPolicyMetadata("cpf-retirement-top-ups"),
  "cpf-housing-refunds": getPolicyMetadata("cpf-housing-refunds"),
  "iras-cpf-cash-top-up-relief": getPolicyMetadata(
    "iras-cpf-cash-top-up-relief",
  ),
  "mom-retirement-re-employment-ages": getPolicyMetadata(
    "mom-retirement-re-employment-ages",
  ),
};
