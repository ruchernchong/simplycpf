import type { AgeGroup } from "@/types";

export const prYear1Rates: AgeGroup[] = [
  {
    description: "55 and below",
    minAge: 0,
    maxAge: 55,
    contributionRate: { employee: 0.05, employer: 0.05 },
    distributionRate: { OA: 1, SA: 0, MA: 0 },
  },
  {
    description: "Above 55 to 60",
    minAge: 55,
    maxAge: 60,
    contributionRate: { employee: 0.05, employer: 0.05 },
    distributionRate: { OA: 1, SA: 0, MA: 0 },
  },
  {
    description: "Above 60 to 65",
    minAge: 60,
    maxAge: 65,
    contributionRate: { employee: 0.025, employer: 0.04 },
    distributionRate: { OA: 1, SA: 0, MA: 0 },
  },
  {
    description: "Above 65 to 70",
    minAge: 65,
    maxAge: 70,
    contributionRate: { employee: 0.015, employer: 0.03 },
    distributionRate: { OA: 1, SA: 0, MA: 0 },
  },
  {
    description: "Above 70",
    minAge: 70,
    contributionRate: { employee: 0.01, employer: 0.025 },
    distributionRate: { OA: 1, SA: 0, MA: 0 },
  },
];

export const prYear2Rates: AgeGroup[] = [
  {
    description: "55 and below",
    minAge: 0,
    maxAge: 55,
    contributionRate: { employee: 0.05, employer: 0.09 },
    distributionRate: { OA: 0.5714, SA: 0.1429, MA: 0.2857 },
  },
  {
    description: "Above 55 to 60",
    minAge: 55,
    maxAge: 60,
    contributionRate: { employee: 0.05, employer: 0.09 },
    distributionRate: { OA: 0.5714, SA: 0.1429, MA: 0.2857 },
  },
  {
    description: "Above 60 to 65",
    minAge: 60,
    maxAge: 65,
    contributionRate: { employee: 0.025, employer: 0.07 },
    distributionRate: { OA: 0.2857, SA: 0.2857, MA: 0.4286 },
  },
  {
    description: "Above 65 to 70",
    minAge: 65,
    maxAge: 70,
    contributionRate: { employee: 0.015, employer: 0.05 },
    distributionRate: { OA: 0.1429, SA: 0.2857, MA: 0.5714 },
  },
  {
    description: "Above 70",
    minAge: 70,
    contributionRate: { employee: 0.01, employer: 0.035 },
    distributionRate: { OA: 0.1429, SA: 0.1429, MA: 0.7143 },
  },
];
