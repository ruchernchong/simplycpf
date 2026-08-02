import type { DistributionRate } from "@/types";

/**
 * Shared age group distribution rates that are duplicated across citizen and
 * PR tables. These are the allocation rates for age groups where allocation
 * does not vary by residency status.
 */
export const seniorDistributionRates: Record<string, DistributionRate> = {
  "Above 50 to 55": { OA: 0.4055, SA: 0.3108, MA: 0.2837 },
  "Above 55 to 60": { OA: 0.353, SA: 0.3382, MA: 0.3088 },
  "Above 60 to 65": { OA: 0.14, SA: 0.44, MA: 0.42 },
  "Above 65 to 70": { OA: 0.0607, SA: 0.303, MA: 0.6363 },
  "Above 70": { OA: 0.08, SA: 0.08, MA: 0.84 },
};
