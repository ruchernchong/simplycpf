import type { AgeGroup } from "@/types";

/**
 * Graduated (G/G) contribution rates for Permanent Residents in their 1st and
 * 2nd year of SPR status, on monthly wages above $750. Allocation rates do not
 * vary by residency status; they are the same age-based ratios used for
 * citizens in src/data/index.ts.
 *
 * Contribution rates: CPF Contribution Rate Table from 1 January 2026,
 * Tables 2 and 3. Unchanged since 1 January 2016.
 * https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPFcontributionratesfrom1Jan2026.pdf
 *
 * Allocation rates: CPF Allocation Rates from 1 January 2026.
 * https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPFAllocationRatesfromJanuary2026.pdf
 *
 * Not modelled: PRs whose employer has an approved joint application to
 * contribute at full employer / full employee (F/F) rates, who use the
 * citizen table instead.
 */
const baseYear1Rates: AgeGroup[] = [
  {
    description: "35 and below",
    minAge: 0,
    maxAge: 35,
    contributionRate: { employee: 0.05, employer: 0.04 },
    distributionRate: { OA: 0.6217, SA: 0.1621, MA: 0.2162 },
  },
  {
    description: "Above 35 to 45",
    minAge: 35,
    maxAge: 45,
    contributionRate: { employee: 0.05, employer: 0.04 },
    distributionRate: { OA: 0.5677, SA: 0.1891, MA: 0.2432 },
  },
  {
    description: "Above 45 to 50",
    minAge: 45,
    maxAge: 50,
    contributionRate: { employee: 0.05, employer: 0.04 },
    distributionRate: { OA: 0.5136, SA: 0.2162, MA: 0.2702 },
  },
  {
    description: "Above 50 to 55",
    minAge: 50,
    maxAge: 55,
    contributionRate: { employee: 0.05, employer: 0.04 },
    distributionRate: { OA: 0.4055, SA: 0.3108, MA: 0.2837 },
  },
  {
    description: "Above 55 to 60",
    minAge: 55,
    maxAge: 60,
    contributionRate: { employee: 0.05, employer: 0.04 },
    distributionRate: { OA: 0.353, SA: 0.3382, MA: 0.3088 },
  },
  {
    description: "Above 60 to 65",
    minAge: 60,
    maxAge: 65,
    contributionRate: { employee: 0.05, employer: 0.035 },
    distributionRate: { OA: 0.14, SA: 0.44, MA: 0.42 },
  },
  {
    description: "Above 65 to 70",
    minAge: 65,
    maxAge: 70,
    contributionRate: { employee: 0.05, employer: 0.035 },
    distributionRate: { OA: 0.0607, SA: 0.303, MA: 0.6363 },
  },
  {
    description: "Above 70",
    minAge: 70,
    contributionRate: { employee: 0.05, employer: 0.035 },
    distributionRate: { OA: 0.08, SA: 0.08, MA: 0.84 },
  },
];

export const permanentResidentYear1Rates = [...baseYear1Rates];

export const permanentResidentYear2Rates: AgeGroup[] = [
  {
    description: "35 and below",
    minAge: 0,
    maxAge: 35,
    contributionRate: { employee: 0.15, employer: 0.09 },
    distributionRate: { OA: 0.6217, SA: 0.1621, MA: 0.2162 },
  },
  {
    description: "Above 35 to 45",
    minAge: 35,
    maxAge: 45,
    contributionRate: { employee: 0.15, employer: 0.09 },
    distributionRate: { OA: 0.5677, SA: 0.1891, MA: 0.2432 },
  },
  {
    description: "Above 45 to 50",
    minAge: 45,
    maxAge: 50,
    contributionRate: { employee: 0.15, employer: 0.09 },
    distributionRate: { OA: 0.5136, SA: 0.2162, MA: 0.2702 },
  },
  {
    description: "Above 50 to 55",
    minAge: 50,
    maxAge: 55,
    contributionRate: { employee: 0.15, employer: 0.09 },
    distributionRate: { OA: 0.4055, SA: 0.3108, MA: 0.2837 },
  },
  {
    description: "Above 55 to 60",
    minAge: 55,
    maxAge: 60,
    contributionRate: { employee: 0.125, employer: 0.06 },
    distributionRate: { OA: 0.353, SA: 0.3382, MA: 0.3088 },
  },
  {
    description: "Above 60 to 65",
    minAge: 60,
    maxAge: 65,
    contributionRate: { employee: 0.075, employer: 0.035 },
    distributionRate: { OA: 0.14, SA: 0.44, MA: 0.42 },
  },
  {
    description: "Above 65 to 70",
    minAge: 65,
    maxAge: 70,
    contributionRate: { employee: 0.05, employer: 0.035 },
    distributionRate: { OA: 0.0607, SA: 0.303, MA: 0.6363 },
  },
  {
    description: "Above 70",
    minAge: 70,
    contributionRate: { employee: 0.05, employer: 0.035 },
    distributionRate: { OA: 0.08, SA: 0.08, MA: 0.84 },
  },
];
