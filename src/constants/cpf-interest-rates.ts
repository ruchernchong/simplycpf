import type { QuarterlyRate } from "@/types";

export const CPF_INTEREST_FLOOR_RATES = {
  OA: 2.5,
  SMRA: 4,
} as const;

/** Percentage-point margin added to the 12-month average 10YSGS yield. */
export const PEGGED_RATE_MARKUP = 1;

export const CPF_INTEREST_RATE_METHODOLOGY = {
  OA: {
    description:
      "Three-month average of major local banks' interest rates, subject to the 2.5% legislated floor.",
    reviewFrequency: "quarterly",
  },
  SMRA: {
    description:
      "Twelve-month average yield of 10-year Singapore Government Securities plus 1 percentage point, subject to the current 4% floor.",
    reviewFrequency: "quarterly",
  },
  sourceUrl:
    "https://www.cpf.gov.sg/service/article/how-are-cpf-interest-rates-determined",
  verifiedAt: "2026-08-01",
  status: "official",
} as const;

export const CPF_ACCOUNT_INTEREST_MAP: Record<string, string> = {
  OA: "Ordinary Account (OA)",
  SA: "Special Account (SA)",
  MA: "MediSave Account (MA)",
  RA: "Retirement Account (RA)",
  SMRA: "Special, MediSave & Retirement Accounts",
};

export interface OfficialQuarterlyCpfRate extends QuarterlyRate {
  effectiveFrom: string;
  effectiveTo: string;
  sourceUrl: string;
  status: "official";
  verifiedAt: "2026-08-01";
}

/**
 * Rates declared by CPF Board. This intentionally contains no reconstructed
 * monthly SGS series: CPF declares the account rates quarterly and publishes
 * the 12-month-average input used for each declaration.
 */
export const QUARTERLY_CPF_RATES: readonly OfficialQuarterlyCpfRate[] = [
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
    status: "official",
    verifiedAt: "2026-08-01",
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
    status: "official",
    verifiedAt: "2026-08-01",
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
    status: "official",
    verifiedAt: "2026-08-01",
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
    status: "official",
    verifiedAt: "2026-08-01",
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
    status: "official",
    verifiedAt: "2026-08-01",
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
    status: "official",
    verifiedAt: "2026-08-01",
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
    status: "official",
    verifiedAt: "2026-08-01",
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
    status: "official",
    verifiedAt: "2026-08-01",
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
    status: "official",
    verifiedAt: "2026-08-01",
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
    status: "official",
    verifiedAt: "2026-08-01",
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
    status: "official",
    verifiedAt: "2026-08-01",
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
    status: "official",
    verifiedAt: "2026-08-01",
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
    status: "official",
    verifiedAt: "2026-08-01",
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
    status: "official",
    verifiedAt: "2026-08-01",
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
    status: "official",
    verifiedAt: "2026-08-01",
  },
] as const;
