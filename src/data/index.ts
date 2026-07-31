import {
  DEFAULT_EMPLOYEE_CONTRIBUTION_RATE,
  DEFAULT_EMPLOYER_CONTRIBUTION_RATE,
} from "@/config";
import type { AgeGroup } from "@/types";

/**
 * Contribution and allocation rates for Singapore Citizens and PRs from the
 * 3rd year onwards, on monthly wages above $750. Effective 1 January 2026.
 *
 * Contribution rates: CPF Contribution Rate Table from 1 January 2026 (Table 1)
 * https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPFcontributionratesfrom1Jan2026.pdf
 *
 * Allocation rates: CPF Allocation Rates from 1 January 2026
 * https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPFAllocationRatesfromJanuary2026.pdf
 *
 * For ages 55 and above the `SA` key carries the Retirement Account share;
 * the Special Account no longer receives contributions after its closure.
 * Per CPF, those contributions go to the RA up to the Full Retirement Sum, and
 * are channelled to the Ordinary Account once the FRS has been set aside.
 */
export const ageGroups: AgeGroup[] = [
  {
    description: "35 and below",
    minAge: 0,
    maxAge: 35,
    contributionRate: {
      employee: DEFAULT_EMPLOYEE_CONTRIBUTION_RATE,
      employer: DEFAULT_EMPLOYER_CONTRIBUTION_RATE,
    },
    distributionRate: { OA: 0.6217, SA: 0.1621, MA: 0.2162 },
  },
  {
    description: "Above 35 to 45",
    minAge: 35,
    maxAge: 45,
    contributionRate: {
      employee: DEFAULT_EMPLOYEE_CONTRIBUTION_RATE,
      employer: DEFAULT_EMPLOYER_CONTRIBUTION_RATE,
    },
    distributionRate: { OA: 0.5677, SA: 0.1891, MA: 0.2432 },
  },
  {
    description: "Above 45 to 50",
    minAge: 45,
    maxAge: 50,
    contributionRate: {
      employee: DEFAULT_EMPLOYEE_CONTRIBUTION_RATE,
      employer: DEFAULT_EMPLOYER_CONTRIBUTION_RATE,
    },
    distributionRate: { OA: 0.5136, SA: 0.2162, MA: 0.2702 },
  },
  {
    description: "Above 50 to 55",
    minAge: 50,
    maxAge: 55,
    contributionRate: {
      employee: DEFAULT_EMPLOYEE_CONTRIBUTION_RATE,
      employer: DEFAULT_EMPLOYER_CONTRIBUTION_RATE,
    },
    distributionRate: { OA: 0.4055, SA: 0.3108, MA: 0.2837 },
  },
  {
    description: "Above 55 to 60",
    minAge: 55,
    maxAge: 60,
    contributionRate: { employee: 0.18, employer: 0.16 },
    distributionRate: { OA: 0.353, SA: 0.3382, MA: 0.3088 },
  },
  {
    description: "Above 60 to 65",
    minAge: 60,
    maxAge: 65,
    contributionRate: { employee: 0.125, employer: 0.125 },
    distributionRate: { OA: 0.14, SA: 0.44, MA: 0.42 },
  },
  {
    description: "Above 65 to 70",
    minAge: 65,
    maxAge: 70,
    contributionRate: { employee: 0.075, employer: 0.09 },
    distributionRate: { OA: 0.0607, SA: 0.303, MA: 0.6363 },
  },
  {
    description: "Above 70",
    minAge: 70,
    contributionRate: { employee: 0.05, employer: 0.075 },
    distributionRate: { OA: 0.08, SA: 0.08, MA: 0.84 },
  },
];
