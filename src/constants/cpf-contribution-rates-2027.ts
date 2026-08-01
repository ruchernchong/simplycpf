import { resolveContributionSchedule } from "@/policy";

const schedule2027 = resolveContributionSchedule("2027-01").schedule;

/** Compatibility adapter for the existing contribution-rate comparison UI. */
export const CPF_TOTAL_CONTRIBUTION_RATES_2027: Record<string, number> =
  Object.fromEntries(
    schedule2027.citizenRates
      .filter(
        (band) => band.id === "above-55-to-60" || band.id === "above-60-to-65",
      )
      .map((band) => [
        band.description,
        (band.employeeBasisPoints + band.employerBasisPoints) / 100,
      ]),
  );
