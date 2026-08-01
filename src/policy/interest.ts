import { POLICY_METADATA, POLICY_SOURCES } from "./sources";

export const CPF_INTEREST_FLOOR_RATES = {
  OA: 2.5,
  SMRA: 4,
} as const;

/** Percentage-point margin added to the 12-month average 10YSGS yield. */
export const CPF_SMRA_PEGGED_RATE_MARKUP = 1;

export const CPF_INTEREST_RATE_METHODOLOGY = {
  ordinaryAccount: {
    peg: "three-month average of major local banks' interest rates",
    floorRate: CPF_INTEREST_FLOOR_RATES.OA,
    reviewFrequency: "quarterly",
  },
  specialMediSaveRetirementAccounts: {
    peg: "12-month average yield of 10-year Singapore Government Securities",
    markupPercentagePoints: CPF_SMRA_PEGGED_RATE_MARKUP,
    floorRate: CPF_INTEREST_FLOOR_RATES.SMRA,
    floorGuaranteedThrough: "2026-12-31",
    reviewFrequency: "quarterly",
  },
  status: "official",
  verifiedAt: POLICY_METADATA["cpf-interest-rates"].verifiedAt,
  sourceUrls: [
    POLICY_SOURCES.interest.url,
    POLICY_SOURCES.interestMethodology.url,
  ],
} as const;

export interface OfficialQuarterlyCpfInterestRate {
  quarter: string;
  effectiveFrom: string;
  effectiveTo: string;
  oa: number;
  sa: number;
  ma: number;
  ra: number;
  sourceUrl: string;
  status: "official";
  verifiedAt: string;
}

/**
 * CPF Board's declared quarterly account rates. There is deliberately no
 * reconstructed monthly SGS series; the SMRA peg consumes a published
 * 12-month average, not individual monthly observations.
 */
export const CPF_QUARTERLY_INTEREST_RATES: readonly OfficialQuarterlyCpfInterestRate[] =
  [
    {
      quarter: "2023 Q1",
      effectiveFrom: "2023-01-01",
      effectiveTo: "2023-03-31",
      oa: 2.5,
      sa: 4,
      ma: 4,
      ra: 4,
      sourceUrl:
        "https://www.cpf.gov.sg/member/infohub/news/news-releases/cpf-interest-rates-from-1-january-2023-to-31-march-2023-and-basic-healthcare-sum-for-2023",
    },
    {
      quarter: "2023 Q2",
      effectiveFrom: "2023-04-01",
      effectiveTo: "2023-06-30",
      oa: 2.5,
      sa: 4,
      ma: 4,
      ra: 4,
      sourceUrl:
        "https://www.cpf.gov.sg/member/infohub/news/news-releases/cpf-interest-rates-from-1-april-2023-to-30-june-2023",
    },
    {
      quarter: "2023 Q3",
      effectiveFrom: "2023-07-01",
      effectiveTo: "2023-09-30",
      oa: 2.5,
      sa: 4.01,
      ma: 4.01,
      ra: 4,
      sourceUrl:
        "https://www.cpf.gov.sg/member/infohub/news/news-releases/cpf-interest-rates-from-1-july-2023-to-30-september-2023",
    },
    {
      quarter: "2023 Q4",
      effectiveFrom: "2023-10-01",
      effectiveTo: "2023-12-31",
      oa: 2.5,
      sa: 4.04,
      ma: 4.04,
      ra: 4,
      sourceUrl:
        "https://www.cpf.gov.sg/member/infohub/news/news-releases/government-extends-4-per-cent-interest-rate-floor-on-special-medisave-and-retirement-account-monies-until-31-december-2024",
    },
    {
      quarter: "2024 Q1",
      effectiveFrom: "2024-01-01",
      effectiveTo: "2024-03-31",
      oa: 2.5,
      sa: 4.08,
      ma: 4.08,
      ra: 4.08,
      sourceUrl:
        "https://www.cpf.gov.sg/member/infohub/news/news-releases/cpf-interest-rates-from-1-january-2024-to-31-march-2024-and-basic-healthcare-sum-for-2024",
    },
    {
      quarter: "2024 Q2",
      effectiveFrom: "2024-04-01",
      effectiveTo: "2024-06-30",
      oa: 2.5,
      sa: 4.05,
      ma: 4.05,
      ra: 4.05,
      sourceUrl:
        "https://www.cpf.gov.sg/member/infohub/news/news-releases/cpf-interest-rates-from-1-april-2024-to-30-june-2024",
    },
    {
      quarter: "2024 Q3",
      effectiveFrom: "2024-07-01",
      effectiveTo: "2024-09-30",
      oa: 2.5,
      sa: 4.08,
      ma: 4.08,
      ra: 4.08,
      sourceUrl:
        "https://www.cpf.gov.sg/member/infohub/news/news-releases/cpf-interest-rates-from-1-july-2024-to-30-september-2024",
    },
    {
      quarter: "2024 Q4",
      effectiveFrom: "2024-10-01",
      effectiveTo: "2024-12-31",
      oa: 2.5,
      sa: 4.14,
      ma: 4.14,
      ra: 4.14,
      sourceUrl:
        "https://www.cpf.gov.sg/member/infohub/news/news-releases/government-extends-4-per-cent-interest-rate-floor-on-special-medisave-and-retirement-account-monies-until-31-december-2025",
    },
    {
      quarter: "2025 Q1",
      effectiveFrom: "2025-01-01",
      effectiveTo: "2025-03-31",
      oa: 2.5,
      sa: 4,
      ma: 4,
      ra: 4,
      sourceUrl:
        "https://www.cpf.gov.sg/member/infohub/news/news-releases/cpf-interest-rates-from-1-january-to-31-march-2025-and-basic-healthcare-sum-for-2025",
    },
    {
      quarter: "2025 Q2",
      effectiveFrom: "2025-04-01",
      effectiveTo: "2025-06-30",
      oa: 2.5,
      sa: 4,
      ma: 4,
      ra: 4,
      sourceUrl:
        "https://www.cpf.gov.sg/member/infohub/news/news-releases/cpf-interest-rates-from-1-april-to-30-june-2025",
    },
    {
      quarter: "2025 Q3",
      effectiveFrom: "2025-07-01",
      effectiveTo: "2025-09-30",
      oa: 2.5,
      sa: 4,
      ma: 4,
      ra: 4,
      sourceUrl:
        "https://www.cpf.gov.sg/member/infohub/news/news-releases/cpf-interest-rates-from-1-july-to-30-september-20251",
    },
    {
      quarter: "2025 Q4",
      effectiveFrom: "2025-10-01",
      effectiveTo: "2025-12-31",
      oa: 2.5,
      sa: 4,
      ma: 4,
      ra: 4,
      sourceUrl:
        "https://www.cpf.gov.sg/member/infohub/news/news-releases/government-extends-4-per-cent-interest-rate-floor-on-special-medisave-and-retirement-account-monies-until-31-december-2026",
    },
    {
      quarter: "2026 Q1",
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-03-31",
      oa: 2.5,
      sa: 4,
      ma: 4,
      ra: 4,
      sourceUrl:
        "https://www.cpf.gov.sg/member/infohub/news/news-releases/cpf-interest-rates-from-1-january-to-31-march-2026-and-basic-healthcare-sum-for-2026",
    },
    {
      quarter: "2026 Q2",
      effectiveFrom: "2026-04-01",
      effectiveTo: "2026-06-30",
      oa: 2.5,
      sa: 4,
      ma: 4,
      ra: 4,
      sourceUrl:
        "https://www.cpf.gov.sg/member/infohub/news/news-releases/cpf-interest-rates-from-1-april-to-30-june-2026",
    },
    {
      quarter: "2026 Q3",
      effectiveFrom: "2026-07-01",
      effectiveTo: "2026-09-30",
      oa: 2.5,
      sa: 4,
      ma: 4,
      ra: 4,
      sourceUrl:
        "https://www.cpf.gov.sg/member/infohub/news/news-releases/cpf-interest-rates-from-1-july-to-30-september-2026",
    },
  ].map((row) => ({
    ...row,
    status: "official" as const,
    verifiedAt: POLICY_METADATA["cpf-interest-rates"].verifiedAt,
  }));
