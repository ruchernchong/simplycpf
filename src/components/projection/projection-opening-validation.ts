import type { AccountBalances } from "@/types";

interface ProjectionOpeningAccountState {
  currentAge: number | null;
  raExistsAtOpening: boolean;
  startMonth: string;
  specialAccountClosureMonth: string;
  initialBalances: AccountBalances;
  initialYearToDateAccruedInterest: AccountBalances;
}

/** Mirrors the monthly ledger's account-state checks before enabling the UI. */
export function isProjectionOpeningAccountStateValid({
  currentAge,
  raExistsAtOpening,
  startMonth,
  specialAccountClosureMonth,
  initialBalances,
  initialYearToDateAccruedInterest,
}: ProjectionOpeningAccountState): boolean {
  if (currentAge === null) return true;

  const retirementAccountStateIsValid =
    raExistsAtOpening ||
    (initialBalances.ra === 0 && initialYearToDateAccruedInterest.ra === 0);
  const januaryInterestStateIsValid =
    !startMonth.endsWith("-01") ||
    Object.values(initialYearToDateAccruedInterest).every(
      (amount) => amount === 0,
    );
  const specialAccountStateIsValid =
    !raExistsAtOpening ||
    startMonth <= specialAccountClosureMonth ||
    initialBalances.sa === 0;

  return (
    retirementAccountStateIsValid &&
    januaryInterestStateIsValid &&
    specialAccountStateIsValid
  );
}
