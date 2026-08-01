import { CPF_CONTRIBUTION_SCHEDULES } from "@/policy";

const schedule2027 = CPF_CONTRIBUTION_SCHEDULES.at(-1);
const previousSchedule = CPF_CONTRIBUTION_SCHEDULES.at(-2);

if (!schedule2027 || !previousSchedule) {
  throw new Error("At least two contribution schedules are required.");
}

/** Compatibility adapter for the existing contribution-rate comparison UI. */
export const CPF_TOTAL_CONTRIBUTION_RATES_2027: Record<string, number> =
  Object.fromEntries(
    schedule2027.citizenRates
      .filter((band) => {
        const previousBand = previousSchedule.citizenRates.find(
          (candidate) => candidate.id === band.id,
        );
        return (
          previousBand !== undefined &&
          previousBand.employeeBasisPoints +
            previousBand.employerBasisPoints !==
            band.employeeBasisPoints + band.employerBasisPoints
        );
      })
      .map((band) => [
        band.description,
        (band.employeeBasisPoints + band.employerBasisPoints) / 100,
      ]),
  );
