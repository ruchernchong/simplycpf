import type { AgeGroup } from "@/types";

export const permanentResidentYear1Rates: AgeGroup[] = [
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
    distributionRate: { OA: 0.4069, SA: 0.2372, MA: 0.3559 },
  },
  {
    description: "Above 60 to 65",
    minAge: 60,
    maxAge: 65,
    contributionRate: { employee: 0.05, employer: 0.035 },
    distributionRate: { OA: 0.1709, SA: 0.317, MA: 0.5121 },
  },
  {
    description: "Above 65 to 70",
    minAge: 65,
    maxAge: 70,
    contributionRate: { employee: 0.05, employer: 0.035 },
    distributionRate: { OA: 0.0646, SA: 0.258, MA: 0.6774 },
  },
  {
    description: "Above 70",
    minAge: 70,
    contributionRate: { employee: 0.05, employer: 0.035 },
    distributionRate: { OA: 0.08, SA: 0.08, MA: 0.84 },
  },
];

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
    distributionRate: { OA: 0.4069, SA: 0.2372, MA: 0.3559 },
  },
  {
    description: "Above 60 to 65",
    minAge: 60,
    maxAge: 65,
    contributionRate: { employee: 0.075, employer: 0.035 },
    distributionRate: { OA: 0.1709, SA: 0.317, MA: 0.5121 },
  },
  {
    description: "Above 65 to 70",
    minAge: 65,
    maxAge: 70,
    contributionRate: { employee: 0.05, employer: 0.035 },
    distributionRate: { OA: 0.0646, SA: 0.258, MA: 0.6774 },
  },
  {
    description: "Above 70",
    minAge: 70,
    contributionRate: { employee: 0.05, employer: 0.035 },
    distributionRate: { OA: 0.08, SA: 0.08, MA: 0.84 },
  },
];
