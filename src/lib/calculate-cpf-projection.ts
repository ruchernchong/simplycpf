import { type BhsPolicyValue, getBhsForProjection } from "@/constants/cpf-bhs";
import { CPF_LIFE_2026_REFERENCE } from "@/constants/cpf-life";
import {
  getCohortRetirementThresholds,
  getRetirementSumsForProjection,
  type RetirementSumsPolicyValue,
} from "@/constants/cpf-retirement-sums";
import { calculateCpfContributionForProjection } from "@/lib/calculate-cpf-contribution";
import type {
  AdditionalWageCeilingContext,
  ContributionCalculationResult,
  PolicyMetadata,
  PolicySource,
  PolicyStatus,
} from "@/policy";
import {
  CPF_CONTRIBUTION_SCHEDULES,
  CPF_INTEREST_FLOOR_RATES,
  CPF_POLICY_RULES,
  CPF_QUARTERLY_INTEREST_RATES,
  CPF_WAGE_RULES,
  getPolicyMetadata,
  resolveSprContributionYear,
} from "@/policy";
import type {
  AccountBalances,
  CitizenshipStatus,
  ProjectionAdditionalWage,
  ProjectionParams,
  ProjectionPolicyMetadata,
  ProjectionResult,
  ProjectionWarning,
  RetirementRouting,
  RetirementTransfer,
  VoluntaryTopUp,
  YearlyBalance,
} from "@/types";

const RETIREMENT_ACCOUNT_AGE =
  CPF_POLICY_RULES.lifecycleAges.retirementAccountCreated;
const CPF_LIFE_ELIGIBILITY_AGE =
  CPF_POLICY_RULES.lifecycleAges.cpfLifePayoutEligibility;
const CPF_LIFE_LATEST_START_AGE =
  CPF_POLICY_RULES.lifecycleAges.latestCpfLifePayoutStart;
const SPECIAL_ACCOUNT_CLOSURE_MONTH =
  CPF_POLICY_RULES.specialAccountClosure.effectiveDate.slice(0, 7);
const RETIREMENT_TOP_UP_POLICY_YEAR = getPolicyMetadata(
  "cpf-retirement-top-ups",
).effectiveFrom.slice(0, 4);
const TAX_RELIEF_POLICY_YEAR = getPolicyMetadata(
  "iras-cpf-cash-top-up-relief",
).effectiveFrom.slice(0, 4);

interface CentsBalances {
  oa: number;
  sa: number;
  ma: number;
  ra: number;
}

interface RaSavingsState {
  /** Official limit measure: principal inflows plus counted withdrawals/premiums. */
  forLimits: number;
  /** Cash principal used for post-55 employment-contribution routing. */
  forContributionRouting: number;
}

interface InterestAccrual {
  base: CentsBalances;
  extraDestination: CentsBalances;
  extraTotal: number;
}

interface YearAccumulator {
  employee: number;
  employer: number;
  total: number;
  distribution: CentsBalances;
  reportedInterest: InterestAccrual;
  housingWithdrawal: number;
  voluntaryTopUp: number;
  topUpPotentialTaxRelief: number;
  unappliedVoluntaryTopUp: number;
  retirementTransfer: number;
  propertyPledgeWithdrawal: number;
}

interface MonthPolicy {
  bhs: BhsPolicyValue;
  retirement: RetirementSumsPolicyValue;
  projection: ProjectionPolicyMetadata;
}

interface MonthlyInterestPolicy {
  rates: { oa: number; sa: number; ma: number; ra: number };
  metadata: PolicyMetadata;
}

function emptyBalances(): CentsBalances {
  return { oa: 0, sa: 0, ma: 0, ra: 0 };
}

function emptyInterest(): InterestAccrual {
  return {
    base: emptyBalances(),
    extraDestination: emptyBalances(),
    extraTotal: 0,
  };
}

function interestDestinationBalances(interest: InterestAccrual): CentsBalances {
  return {
    oa: interest.base.oa + interest.extraDestination.oa,
    sa: interest.base.sa + interest.extraDestination.sa,
    ma: interest.base.ma + interest.extraDestination.ma,
    ra: interest.base.ra + interest.extraDestination.ra,
  };
}

function emptyYearAccumulator(): YearAccumulator {
  return {
    employee: 0,
    employer: 0,
    total: 0,
    distribution: emptyBalances(),
    reportedInterest: emptyInterest(),
    housingWithdrawal: 0,
    voluntaryTopUp: 0,
    topUpPotentialTaxRelief: 0,
    unappliedVoluntaryTopUp: 0,
    retirementTransfer: 0,
    propertyPledgeWithdrawal: 0,
  };
}

function toCents(value: number): number {
  return Math.round(value * 100);
}

function fromCents(value: number): number {
  return Math.round(value) / 100;
}

function balancesFromCents(value: CentsBalances): AccountBalances {
  return {
    oa: fromCents(value.oa),
    sa: fromCents(value.sa),
    ma: fromCents(value.ma),
    ra: fromCents(value.ra),
  };
}

function balancesToCents(value: AccountBalances): CentsBalances {
  return {
    oa: toCents(value.oa),
    sa: toCents(value.sa),
    ma: toCents(value.ma),
    ra: toCents(value.ra),
  };
}

function validateBalances(value: AccountBalances): void {
  for (const [account, balance] of Object.entries(value)) {
    if (!Number.isFinite(balance) || balance < 0) {
      throw new RangeError(
        `${account.toUpperCase()} balance must be zero or more.`,
      );
    }
  }
}

function validateMoney(value: number | undefined, label: string): void {
  if (value !== undefined && (!Number.isFinite(value) || value < 0)) {
    throw new RangeError(`${label} must be zero or more.`);
  }
}

interface PreparedAdditionalWage {
  amount: number;
  context: AdditionalWageCeilingContext;
}

function requiredMoney(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be zero or more.`);
  }
  return value;
}

function prepareAdditionalWages(
  payments: ProjectionAdditionalWage[] | undefined,
  startSerial: number,
  endSerial: number,
): Map<string, PreparedAdditionalWage> {
  const prepared = new Map<string, PreparedAdditionalWage>();
  if (payments === undefined) return prepared;
  if (!Array.isArray(payments)) {
    throw new RangeError(
      "additionalWages must be an array of explicitly dated payments.",
    );
  }

  for (const [index, payment] of payments.entries()) {
    const field = `additionalWages[${index}]`;
    if (!payment || typeof payment !== "object") {
      throw new RangeError(`${field} must be an object.`);
    }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(payment.contributionMonth)) {
      throw new RangeError(
        `${field}.contributionMonth must be in YYYY-MM format.`,
      );
    }
    if (prepared.has(payment.contributionMonth)) {
      throw new RangeError(
        `additionalWages contains more than one payment for ${payment.contributionMonth}; combine payments made in the same contribution month.`,
      );
    }

    const { year, month } = parseMonth(payment.contributionMonth);
    const serial = monthSerial(year, month);
    if (serial < startSerial || serial > endSerial) {
      throw new RangeError(
        `${field}.contributionMonth must fall within the projection range.`,
      );
    }
    const amount = requiredMoney(payment.amount, `${field}.amount`);
    if (amount === 0) {
      throw new RangeError(`${field}.amount must be greater than zero.`);
    }

    const context = payment.additionalWageCeilingContext;
    if (!context || typeof context !== "object") {
      throw new RangeError(
        `${field}.additionalWageCeilingContext is required for a positive Additional Wage payment.`,
      );
    }
    if ("remainingAdditionalWageCeiling" in context) {
      const remaining = requiredMoney(
        context.remainingAdditionalWageCeiling,
        `${field}.additionalWageCeilingContext.remainingAdditionalWageCeiling`,
      );
      if (
        "annualOrdinaryWagesSubjectToCpf" in context ||
        "priorAdditionalWagesSubjectToCpf" in context
      ) {
        throw new RangeError(
          `${field}.additionalWageCeilingContext must use one context form only.`,
        );
      }
      if (remaining > CPF_WAGE_RULES.annualAdditionalWageCeiling) {
        throw new RangeError(
          `${field}.additionalWageCeilingContext.remainingAdditionalWageCeiling cannot exceed S$${CPF_WAGE_RULES.annualAdditionalWageCeiling.toLocaleString("en-SG")}.`,
        );
      }
      prepared.set(payment.contributionMonth, {
        amount,
        context: {
          annualOrdinaryWagesSubjectToCpf:
            CPF_WAGE_RULES.annualAdditionalWageCeiling - remaining,
          priorAdditionalWagesSubjectToCpf: 0,
        },
      });
      continue;
    }

    if (
      !("annualOrdinaryWagesSubjectToCpf" in context) ||
      !("priorAdditionalWagesSubjectToCpf" in context)
    ) {
      throw new RangeError(
        `${field}.additionalWageCeilingContext must provide both annualOrdinaryWagesSubjectToCpf and priorAdditionalWagesSubjectToCpf, or remainingAdditionalWageCeiling.`,
      );
    }
    prepared.set(payment.contributionMonth, {
      amount,
      context: {
        annualOrdinaryWagesSubjectToCpf: requiredMoney(
          context.annualOrdinaryWagesSubjectToCpf,
          `${field}.additionalWageCeilingContext.annualOrdinaryWagesSubjectToCpf`,
        ),
        priorAdditionalWagesSubjectToCpf: requiredMoney(
          context.priorAdditionalWagesSubjectToCpf,
          `${field}.additionalWageCeilingContext.priorAdditionalWagesSubjectToCpf`,
        ),
      },
    });
  }
  return prepared;
}

function parseBirthDate(value: string): { month: number; year: number } {
  const match = /^(0[1-9]|1[0-2])\/(\d{4})$/.exec(value);
  if (!match) {
    throw new RangeError("birthDate must be in MM/YYYY format.");
  }
  return { month: Number(match[1]), year: Number(match[2]) };
}

function parseMonth(value: string): { month: number; year: number } {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value);
  if (!match) {
    throw new RangeError("startMonth must be in YYYY-MM format.");
  }
  return { month: Number(match[2]), year: Number(match[1]) };
}

function monthSerial(year: number, month: number): number {
  return year * 12 + month - 1;
}

function monthFromSerial(serial: number): { month: number; year: number } {
  return { year: Math.floor(serial / 12), month: (serial % 12) + 1 };
}

function formatMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getCurrentSingaporeMonth(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-SG", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = parts.find(({ type }) => type === "year")?.value;
  const month = parts.find(({ type }) => type === "month")?.value;
  if (!year || !month) {
    throw new Error("Could not resolve the current Singapore month.");
  }
  return `${year}-${month}`;
}

function ageInMonth(
  year: number,
  month: number,
  birthYear: number,
  birthMonth: number,
): number {
  return year - birthYear - (month < birthMonth ? 1 : 0);
}

function describeAgeGroup(contribution: ContributionCalculationResult): string {
  const schedule = CPF_CONTRIBUTION_SCHEDULES.find(
    (candidate) => candidate.id === contribution.schedule.id,
  );
  const band = schedule?.allocationRates.find(
    (candidate) => candidate.id === contribution.age.allocationBand,
  );
  if (!band) {
    throw new Error(
      `Allocation band ${contribution.age.allocationBand} is missing from ${contribution.schedule.id}.`,
    );
  }
  return band.description;
}

function addBalances(target: CentsBalances, addition: CentsBalances): void {
  target.oa += addition.oa;
  target.sa += addition.sa;
  target.ma += addition.ma;
  target.ra += addition.ra;
}

function addInterest(target: InterestAccrual, addition: InterestAccrual): void {
  addBalances(target.base, addition.base);
  addBalances(target.extraDestination, addition.extraDestination);
  target.extraTotal += addition.extraTotal;
}

function routeToRetirement(
  balances: CentsBalances,
  amount: number,
  age: number,
  retirementThreshold: number,
  raSavings: RaSavingsState,
  spaceBasis: "forLimits" | "forContributionRouting",
): CentsBalances {
  const distribution = emptyBalances();
  if (amount <= 0) return distribution;

  if (age < RETIREMENT_ACCOUNT_AGE) {
    balances.sa += amount;
    distribution.sa = amount;
    return distribution;
  }

  const raSpace = Math.max(0, retirementThreshold - raSavings[spaceBasis]);
  const toRa = Math.min(amount, raSpace);
  const toOa = amount - toRa;
  balances.ra += toRa;
  balances.oa += toOa;
  raSavings.forLimits += toRa;
  raSavings.forContributionRouting += toRa;
  distribution.ra = toRa;
  distribution.oa = toOa;
  return distribution;
}

function routeMaOverflow(
  balances: CentsBalances,
  overflow: number,
  age: number,
  under55Frs: number,
  retirementThreshold: number,
  netSaInvestmentWithdrawals: number,
  raSavings: RaSavingsState,
): CentsBalances {
  const distribution = emptyBalances();
  if (overflow <= 0) return distribution;

  if (age < RETIREMENT_ACCOUNT_AGE) {
    const saSpace = Math.max(
      0,
      under55Frs - balances.sa - netSaInvestmentWithdrawals,
    );
    const toSa = Math.min(overflow, saSpace);
    const toOa = overflow - toSa;
    balances.sa += toSa;
    balances.oa += toOa;
    distribution.sa = toSa;
    distribution.oa = toOa;
    return distribution;
  }

  return routeToRetirement(
    balances,
    overflow,
    age,
    retirementThreshold,
    raSavings,
    "forLimits",
  );
}

function enforceBhs(
  balances: CentsBalances,
  bhs: number,
  age: number,
  under55Frs: number,
  retirementThreshold: number,
  netSaInvestmentWithdrawals: number,
  raSavings: RaSavingsState,
): CentsBalances {
  const overflow = Math.max(0, balances.ma - bhs);
  if (overflow === 0) return emptyBalances();
  balances.ma -= overflow;
  return routeMaOverflow(
    balances,
    overflow,
    age,
    under55Frs,
    retirementThreshold,
    netSaInvestmentWithdrawals,
    raSavings,
  );
}

function prepareAge55AccountCreation(
  balances: CentsBalances,
  fullRetirementSum: number,
  retainedRetirementSum: number,
  closeSa: boolean,
  raSavings: RaSavingsState,
): { pending: CentsBalances; propertyPledgeWithdrawal: number } {
  const pending = emptyBalances();
  const raSpaceBeforeSa = Math.max(0, fullRetirementSum - raSavings.forLimits);
  const fromSa = Math.min(balances.sa, raSpaceBeforeSa);
  balances.sa -= fromSa;
  pending.ra += fromSa;

  const raSpaceBeforeOa = Math.max(
    0,
    fullRetirementSum - raSavings.forLimits - pending.ra,
  );
  const fromOa = Math.min(balances.oa, raSpaceBeforeOa);
  balances.oa -= fromOa;
  pending.ra += fromOa;

  if (closeSa && balances.sa > 0) {
    pending.oa += balances.sa;
    balances.sa = 0;
  }
  raSavings.forLimits += fromSa + fromOa;
  raSavings.forContributionRouting += fromSa + fromOa;
  const propertyPledgeWithdrawal = Math.max(
    0,
    Math.min(
      balances.ra + pending.ra,
      raSavings.forLimits - retainedRetirementSum,
    ),
  );
  const withdrawnFromPending = Math.min(pending.ra, propertyPledgeWithdrawal);
  pending.ra -= withdrawnFromPending;
  balances.ra -= propertyPledgeWithdrawal - withdrawnFromPending;
  raSavings.forContributionRouting = Math.max(
    0,
    raSavings.forContributionRouting - propertyPledgeWithdrawal,
  );
  return { pending, propertyPledgeWithdrawal };
}

function prepareSpecialAccountClosure(
  balances: CentsBalances,
  retirementThreshold: number,
  raSavings: RaSavingsState,
): CentsBalances {
  const pending = emptyBalances();
  const toRa = Math.min(
    balances.sa,
    Math.max(0, retirementThreshold - raSavings.forLimits),
  );
  balances.sa -= toRa;
  pending.ra = toRa;
  pending.oa = balances.sa;
  balances.sa = 0;
  raSavings.forLimits += toRa;
  raSavings.forContributionRouting += toRa;
  return pending;
}

function calculateMonthlyInterest(
  balances: CentsBalances,
  age: number,
  rates: MonthlyInterestPolicy["rates"],
): InterestAccrual {
  const rules = CPF_POLICY_RULES.extraInterest;
  const accrual = emptyInterest();
  accrual.base.oa = Math.round((balances.oa * (rates.oa / 100)) / 12);
  accrual.base.sa = Math.round((balances.sa * (rates.sa / 100)) / 12);
  accrual.base.ma = Math.round((balances.ma * (rates.ma / 100)) / 12);
  accrual.base.ra = Math.round((balances.ra * (rates.ra / 100)) / 12);

  let combinedUsed = 0;
  const orderedAccounts: (keyof CentsBalances)[] = rules.accountPriority.map(
    (account) => {
      switch (account) {
        case "RA":
          return "ra";
        case "OA":
          return "oa";
        case "SA":
          return "sa";
        case "MA":
          return "ma";
        default:
          throw new Error(`Unsupported extra-interest account: ${account}.`);
      }
    },
  );

  for (const account of orderedAccounts) {
    const accountBalance =
      account === "oa"
        ? Math.min(balances.oa, toCents(rules.ordinaryAccountCap))
        : balances[account];
    const eligible = Math.min(
      accountBalance,
      Math.max(0, toCents(rules.combinedBalanceCap) - combinedUsed),
    );
    if (eligible <= 0) continue;

    let interest = 0;
    if (age >= RETIREMENT_ACCOUNT_AGE) {
      const firstTier = Math.min(
        eligible,
        Math.max(
          0,
          toCents(rules.age55AndAbove.firstTier.balanceCap) - combinedUsed,
        ),
      );
      const secondTier = eligible - firstTier;
      interest =
        Math.round(
          (firstTier *
            (rules.age55AndAbove.firstTier.extraPercentagePoints / 100)) /
            12,
        ) +
        Math.round(
          (secondTier *
            (rules.age55AndAbove.secondTier.extraPercentagePoints / 100)) /
            12,
        );
    } else {
      interest = Math.round(
        (eligible * (rules.below55.extraPercentagePoints / 100)) / 12,
      );
    }

    combinedUsed += eligible;
    accrual.extraTotal += interest;

    if (account === "oa") {
      const destination =
        age >= RETIREMENT_ACCOUNT_AGE
          ? rules.age55AndAbove.oaExtraInterestCreditedTo
          : rules.below55.oaExtraInterestCreditedTo;
      if (destination === "RA") {
        accrual.extraDestination.ra += interest;
      } else accrual.extraDestination.sa += interest;
    } else {
      accrual.extraDestination[account] += interest;
    }
  }

  return accrual;
}

function creditAnnualInterest(
  balances: CentsBalances,
  accrual: InterestAccrual,
  saClosed: boolean,
  retirementThreshold: number,
  raSavings: RaSavingsState,
): void {
  balances.oa += accrual.base.oa + accrual.extraDestination.oa;
  balances.ma += accrual.base.ma + accrual.extraDestination.ma;
  balances.ra += accrual.base.ra + accrual.extraDestination.ra;

  const saCredit = accrual.base.sa + accrual.extraDestination.sa;
  if (saClosed) {
    const toRa = Math.min(
      saCredit,
      Math.max(0, retirementThreshold - raSavings.forLimits),
    );
    balances.ra += toRa;
    balances.oa += saCredit - toRa;
  } else {
    balances.sa += saCredit;
  }
}

function shouldApplyFrequency(
  frequency: "monthly" | "yearly",
  isFirstMonth: boolean,
  isAnniversaryMonth: boolean,
): boolean {
  return frequency === "monthly" || isFirstMonth || isAnniversaryMonth;
}

function shouldApplyTransfer(
  timing: RetirementTransfer["timing"],
  isFirstMonth: boolean,
  isAnniversaryMonth: boolean,
): boolean {
  if (timing === "monthly") return true;
  if (timing === "now") return isFirstMonth;
  return isFirstMonth || isAnniversaryMonth;
}

interface PreparedRetirementTransfer {
  existingSavings: number;
  freshSavingsRequested: number;
}

function retirementTransferSpace(
  balances: CentsBalances,
  age: number,
  currentFrs: number,
  currentErs: number,
  netSaInvestmentWithdrawals: number,
  raSavings: RaSavingsState,
): number {
  const targetBalance =
    age < RETIREMENT_ACCOUNT_AGE ? balances.sa : raSavings.forLimits;
  const targetLimit = age < RETIREMENT_ACCOUNT_AGE ? currentFrs : currentErs;
  return Math.max(
    0,
    targetLimit -
      targetBalance -
      (age < RETIREMENT_ACCOUNT_AGE ? netSaInvestmentWithdrawals : 0),
  );
}

function prepareRetirementTransfer(
  balances: CentsBalances,
  transfer: RetirementTransfer | undefined,
  isFirstMonth: boolean,
  isAnniversaryMonth: boolean,
  age: number,
  currentFrs: number,
  currentErs: number,
  netSaInvestmentWithdrawals: number,
  raSavings: RaSavingsState,
): PreparedRetirementTransfer {
  if (
    !transfer ||
    transfer.amount <= 0 ||
    !shouldApplyTransfer(transfer.timing, isFirstMonth, isAnniversaryMonth)
  ) {
    return { existingSavings: 0, freshSavingsRequested: 0 };
  }

  const targetSpace = retirementTransferSpace(
    balances,
    age,
    currentFrs,
    currentErs,
    netSaInvestmentWithdrawals,
    raSavings,
  );
  const requested = toCents(transfer.amount);
  const existingSavings = Math.min(requested, balances.oa, targetSpace);
  balances.oa -= existingSavings;
  return {
    existingSavings,
    freshSavingsRequested:
      transfer.timing === "now"
        ? 0
        : Math.min(requested - existingSavings, targetSpace - existingSavings),
  };
}

function finishRetirementTransfer(
  balances: CentsBalances,
  amount: number,
  age: number,
): void {
  if (age < RETIREMENT_ACCOUNT_AGE) balances.sa += amount;
  else balances.ra += amount;
}

function applyFreshRetirementTransfer(
  balances: CentsBalances,
  requested: number,
  age: number,
  currentFrs: number,
  currentErs: number,
  netSaInvestmentWithdrawals: number,
  raSavings: RaSavingsState,
): number {
  const amount = Math.min(
    requested,
    balances.oa,
    retirementTransferSpace(
      balances,
      age,
      currentFrs,
      currentErs,
      netSaInvestmentWithdrawals,
      raSavings,
    ),
  );
  balances.oa -= amount;
  finishRetirementTransfer(balances, amount, age);
  if (age >= RETIREMENT_ACCOUNT_AGE) raSavings.forLimits += amount;
  if (age >= RETIREMENT_ACCOUNT_AGE) {
    raSavings.forContributionRouting += amount;
  }
  return amount;
}

function applyVoluntaryTopUp(
  balances: CentsBalances,
  topUp: VoluntaryTopUp | undefined,
  isFirstMonth: boolean,
  isAnniversaryMonth: boolean,
  age: number,
  bhs: number,
  currentFrs: number,
  currentErs: number,
  netSaInvestmentWithdrawals: number,
  taxReliefUsed: number,
  raSavings: RaSavingsState,
): {
  amount: number;
  potentialTaxRelief: number;
  unappliedAmount: number;
} {
  if (
    !topUp ||
    topUp.amount <= 0 ||
    !shouldApplyFrequency(topUp.frequency, isFirstMonth, isAnniversaryMonth)
  ) {
    return { amount: 0, potentialTaxRelief: 0, unappliedAmount: 0 };
  }

  const requested = toCents(topUp.amount);
  const remainingTaxRelief = Math.max(
    0,
    toCents(CPF_POLICY_RULES.retirementTopUps.taxRelief.selfAnnualCap) -
      taxReliefUsed,
  );

  if (topUp.account === "MA") {
    const capacity = Math.max(0, bhs - balances.ma);
    // CPF Board refunds the full MA top-up if that transaction would exceed
    // the member's BHS. It does not accept only the remaining capacity.
    if (requested > capacity) {
      return {
        amount: 0,
        potentialTaxRelief: 0,
        unappliedAmount: requested,
      };
    }
    balances.ma += requested;
    return {
      amount: requested,
      potentialTaxRelief: 0,
      unappliedAmount: 0,
    };
  }

  const destinationBalance =
    age < RETIREMENT_ACCOUNT_AGE ? balances.sa : raSavings.forLimits;
  const actualLimit = age < RETIREMENT_ACCOUNT_AGE ? currentFrs : currentErs;
  const reliefLimit = currentFrs;
  const amount = Math.min(
    requested,
    Math.max(
      0,
      actualLimit -
        destinationBalance -
        (age < RETIREMENT_ACCOUNT_AGE ? netSaInvestmentWithdrawals : 0),
    ),
  );
  const potentialTaxRelief = Math.min(
    amount,
    Math.max(
      0,
      reliefLimit -
        destinationBalance -
        (age < RETIREMENT_ACCOUNT_AGE ? netSaInvestmentWithdrawals : 0),
    ),
    remainingTaxRelief,
  );

  if (age < RETIREMENT_ACCOUNT_AGE) balances.sa += amount;
  else {
    balances.ra += amount;
    raSavings.forLimits += amount;
    raSavings.forContributionRouting += amount;
  }
  return {
    amount,
    potentialTaxRelief,
    unappliedAmount: requested - amount,
  };
}

function applyContribution(
  balances: CentsBalances,
  calculation: ContributionCalculationResult,
  age: number,
  saClosed: boolean,
  bhs: number,
  currentFrs: number,
  contributionRetirementThreshold: number,
  maOverflowRetirementThreshold: number,
  netSaInvestmentWithdrawals: number,
  raSavings: RaSavingsState,
): CentsBalances {
  const allocated = emptyBalances();
  const ma = toCents(calculation.distribution.MA);
  const retirement = toCents(
    (calculation.distribution.SA ?? 0) + (calculation.distribution.RA ?? 0),
  );
  const oa = toCents(calculation.distribution.OA);

  const maSpace = Math.max(0, bhs - balances.ma);
  const toMa = Math.min(ma, maSpace);
  balances.ma += toMa;
  allocated.ma += toMa;
  const overflow = routeMaOverflow(
    balances,
    ma - toMa,
    age,
    currentFrs,
    maOverflowRetirementThreshold,
    netSaInvestmentWithdrawals,
    raSavings,
  );
  addBalances(allocated, overflow);

  if (saClosed || calculation.distribution.RA !== undefined) {
    const routed = routeToRetirement(
      balances,
      retirement,
      Math.max(RETIREMENT_ACCOUNT_AGE, age),
      contributionRetirementThreshold,
      raSavings,
      "forContributionRouting",
    );
    addBalances(allocated, routed);
  } else {
    balances.sa += retirement;
    allocated.sa += retirement;
  }

  balances.oa += oa;
  allocated.oa += oa;
  return allocated;
}

function resolveMonthlyInterestPolicy(month: string): MonthlyInterestPolicy {
  const declaration = CPF_QUARTERLY_INTEREST_RATES.find(
    (candidate) =>
      month >= candidate.effectiveFrom.slice(0, 7) &&
      month <= candidate.effectiveTo.slice(0, 7),
  );
  if (declaration) {
    const declarationSource: PolicySource = {
      id: `cpf-interest-${declaration.quarter.toLowerCase().replaceAll(" ", "-")}`,
      agency: "CPF Board",
      title: `CPF declared interest rates for ${declaration.quarter}`,
      url: declaration.sourceUrl,
    };
    return {
      rates: {
        oa: declaration.oa,
        sa: declaration.sa,
        ma: declaration.ma,
        ra: declaration.ra,
      },
      metadata: getPolicyMetadata("cpf-interest-rates", {
        version: declaration.quarter,
        effectiveFrom: declaration.effectiveFrom,
        effectiveTo: declaration.effectiveTo,
        sources: [declarationSource],
      }),
    };
  }

  const latestDeclaration = CPF_QUARTERLY_INTEREST_RATES.at(-1);
  if (
    !latestDeclaration ||
    month < latestDeclaration.effectiveFrom.slice(0, 7)
  ) {
    throw new RangeError(
      `No sourced CPF interest policy is available for ${month}.`,
    );
  }
  return {
    rates: {
      oa: CPF_INTEREST_FLOOR_RATES.OA,
      sa: CPF_INTEREST_FLOOR_RATES.SMRA,
      ma: CPF_INTEREST_FLOOR_RATES.SMRA,
      ra: CPF_INTEREST_FLOOR_RATES.SMRA,
    },
    metadata: getPolicyMetadata("cpf-interest-rates", {
      version: `${month}-floor-preset-after-${latestDeclaration.quarter.toLowerCase().replaceAll(" ", "-")}`,
      status: "assumed",
      effectiveFrom: `${month}-01`,
      notes: [
        `No quarterly declaration is published for ${month}; the official ${CPF_INTEREST_FLOOR_RATES.OA}% OA and ${CPF_INTEREST_FLOOR_RATES.SMRA}% SMRA floor rates are used as a SimplyCPF assumption.`,
      ],
    }),
  };
}

function monthPolicy(
  year: number,
  birthYear: number,
  contribution: ContributionCalculationResult,
  cohortRetirementSum: PolicyMetadata,
  interest: PolicyMetadata,
  usesTopUpPolicy: boolean,
  usesRetirementCashTopUpPolicy: boolean,
  usesMaCashTopUpPolicy: boolean,
): MonthPolicy {
  const bhs = getBhsForProjection(year, birthYear);
  const retirement = getRetirementSumsForProjection(year);
  const contributionMetadata = contribution.policy.contribution;
  const allocationMetadata = contribution.policy.allocation;
  const wageCeilingMetadata = contribution.policy.wageCeiling;
  const verifiedYear = Number(
    CPF_POLICY_RULES.extraInterest.verifiedAt.slice(0, 4),
  );
  const maTopUpRuleIsOfficial = year === verifiedYear;
  const maTopUpPolicy = getPolicyMetadata("cpf-basic-healthcare-sum", {
    version: maTopUpRuleIsOfficial
      ? `${verifiedYear}-medisave-top-up-limit`
      : `${verifiedYear}-medisave-top-up-limit-${year < verifiedYear ? "backcast" : "frozen"}-for-${year}`,
    status: maTopUpRuleIsOfficial ? "official" : "assumed",
    effectiveFrom: `${year}-01-01`,
    effectiveTo: `${year}-12-31`,
    ...(maTopUpRuleIsOfficial
      ? {}
      : {
          notes: [
            `The MediSave cash top-up rejection rule verified in ${verifiedYear} is ${year < verifiedYear ? "backcast" : "held constant"} for ${year}.`,
          ],
        }),
  });
  const bhsMetadata = usesMaCashTopUpPolicy
    ? mergePolicyMetadata(bhs.metadata, maTopUpPolicy)
    : bhs.metadata;
  const extraInterest = getPolicyMetadata("cpf-extra-interest", {
    version:
      year <= verifiedYear
        ? `from-${CPF_POLICY_RULES.extraInterest.effectiveFrom}`
        : `${verifiedYear}-rules-frozen-for-${year}`,
    status: year <= verifiedYear ? "official" : "assumed",
    effectiveFrom:
      year <= verifiedYear
        ? CPF_POLICY_RULES.extraInterest.effectiveFrom
        : `${year}-01-01`,
    ...(year > verifiedYear
      ? {
          effectiveTo: `${year}-12-31`,
          notes: [
            `The extra-interest rules verified in ${verifiedYear} are held constant for ${year}.`,
          ],
        }
      : {}),
  });
  const specialAccountClosure = getPolicyMetadata(
    "cpf-special-account-closure",
    {
      version: CPF_POLICY_RULES.specialAccountClosure.effectiveDate,
      effectiveFrom: CPF_POLICY_RULES.specialAccountClosure.effectiveDate,
    },
  );
  const topUpRuleYear = Number(
    CPF_POLICY_RULES.retirementTopUps.effectiveFrom.slice(0, 4),
  );
  const topUpRuleIsOfficial = year === topUpRuleYear;
  const retirementTopUps = getPolicyMetadata("cpf-retirement-top-ups", {
    version: topUpRuleIsOfficial
      ? String(topUpRuleYear)
      : `${topUpRuleYear}-rules-${year < topUpRuleYear ? "backcast" : "frozen"}-for-${year}`,
    status: topUpRuleIsOfficial ? "official" : "assumed",
    effectiveFrom: `${year}-01-01`,
    effectiveTo: `${year}-12-31`,
    ...(topUpRuleIsOfficial
      ? {}
      : {
          notes: [
            `The retirement top-up rules sourced for ${topUpRuleYear} are ${year < topUpRuleYear ? "backcast" : "held constant"} for ${year}.`,
          ],
        }),
  });
  const taxRelief = getPolicyMetadata("iras-cpf-cash-top-up-relief", {
    version: topUpRuleIsOfficial
      ? String(topUpRuleYear)
      : `${topUpRuleYear}-rules-${year < topUpRuleYear ? "backcast" : "frozen"}-for-${year}`,
    status: topUpRuleIsOfficial ? "official" : "assumed",
    effectiveFrom: `${year}-01-01`,
    effectiveTo: `${year}-12-31`,
    ...(topUpRuleIsOfficial
      ? {}
      : {
          notes: [
            `The cash top-up relief rules sourced for ${topUpRuleYear} are ${year < topUpRuleYear ? "backcast" : "held constant"} for ${year}.`,
          ],
        }),
  });
  const statuses: PolicyStatus[] = [
    contributionMetadata.status,
    allocationMetadata.status,
    wageCeilingMetadata.status,
    bhsMetadata.status,
    retirement.metadata.status,
    ...(year >= birthYear + RETIREMENT_ACCOUNT_AGE
      ? [cohortRetirementSum.status]
      : []),
    interest.status,
    extraInterest.status,
    specialAccountClosure.status,
    ...(usesTopUpPolicy ? [retirementTopUps.status] : []),
    ...(usesRetirementCashTopUpPolicy ? [taxRelief.status] : []),
  ];

  return {
    bhs,
    retirement,
    projection: {
      status: statuses.includes("assumed") ? "assumed" : "official",
      contribution: contributionMetadata,
      allocation: allocationMetadata,
      wageCeiling: wageCeilingMetadata,
      bhs: bhsMetadata,
      retirementSums: retirement.metadata,
      cohortRetirementSum,
      interest,
      extraInterest,
      specialAccountClosure,
      retirementTopUps,
      taxRelief,
    },
  };
}

function mergePolicyMetadata(
  earlier: PolicyMetadata,
  later: PolicyMetadata,
): PolicyMetadata {
  if (earlier.dataset !== later.dataset) {
    throw new Error(
      `Cannot merge ${earlier.dataset} metadata with ${later.dataset}.`,
    );
  }
  const versions = new Set([
    ...earlier.version.split(" | "),
    ...later.version.split(" | "),
  ]);
  const sourcesById = new Map(
    earlier.sources.map((source) => [source.id, source]),
  );
  for (const source of later.sources) sourcesById.set(source.id, source);
  const notes = new Set([...(earlier.notes ?? []), ...(later.notes ?? [])]);
  const effectiveTo =
    earlier.effectiveTo && later.effectiveTo
      ? earlier.effectiveTo > later.effectiveTo
        ? earlier.effectiveTo
        : later.effectiveTo
      : undefined;

  return {
    ...earlier,
    version: [...versions].join(" | "),
    status:
      earlier.status === "assumed" || later.status === "assumed"
        ? "assumed"
        : "official",
    effectiveFrom:
      earlier.effectiveFrom < later.effectiveFrom
        ? earlier.effectiveFrom
        : later.effectiveFrom,
    effectiveTo,
    sources: [...sourcesById.values()],
    ...(notes.size > 0 ? { notes: [...notes] } : {}),
  };
}

function mergeProjectionPolicyMetadata(
  earlier: ProjectionPolicyMetadata,
  later: ProjectionPolicyMetadata,
): ProjectionPolicyMetadata {
  const merged = {
    contribution: mergePolicyMetadata(earlier.contribution, later.contribution),
    allocation: mergePolicyMetadata(earlier.allocation, later.allocation),
    wageCeiling: mergePolicyMetadata(earlier.wageCeiling, later.wageCeiling),
    bhs: mergePolicyMetadata(earlier.bhs, later.bhs),
    retirementSums: mergePolicyMetadata(
      earlier.retirementSums,
      later.retirementSums,
    ),
    cohortRetirementSum: mergePolicyMetadata(
      earlier.cohortRetirementSum,
      later.cohortRetirementSum,
    ),
    interest: mergePolicyMetadata(earlier.interest, later.interest),
    extraInterest: mergePolicyMetadata(
      earlier.extraInterest,
      later.extraInterest,
    ),
    specialAccountClosure: mergePolicyMetadata(
      earlier.specialAccountClosure,
      later.specialAccountClosure,
    ),
    retirementTopUps: mergePolicyMetadata(
      earlier.retirementTopUps,
      later.retirementTopUps,
    ),
    taxRelief: mergePolicyMetadata(earlier.taxRelief, later.taxRelief),
  };
  const status: PolicyStatus =
    earlier.status === "assumed" || later.status === "assumed"
      ? "assumed"
      : "official";
  return { status, ...merged };
}

function addWarning(
  warnings: Map<ProjectionWarning["code"], ProjectionWarning>,
  warning: ProjectionWarning,
): void {
  if (!warnings.has(warning.code)) warnings.set(warning.code, warning);
}

export function calculateCpfProjection(
  params: ProjectionParams,
): ProjectionResult {
  const warnings = new Map<ProjectionWarning["code"], ProjectionWarning>();
  const startMonth = params.startMonth ?? getCurrentSingaporeMonth();
  if (!params.startMonth) {
    addWarning(warnings, {
      code: "start-month-defaulted",
      message:
        "No startMonth was supplied, so the projection starts in the current month.",
    });
  }

  const initialBalances = params.initialBalances ?? emptyBalances();
  if (!params.initialBalances) {
    addWarning(warnings, {
      code: "initial-balances-defaulted",
      message:
        "Legacy request: OA, SA, MA and RA starting balances defaulted to zero. Add initialBalances for a complete projection.",
    });
  }
  validateBalances(initialBalances);
  const initialYearToDateAccruedInterest =
    params.initialYearToDateAccruedInterest ?? emptyBalances();
  validateBalances(initialYearToDateAccruedInterest);

  const birth = parseBirthDate(params.birthDate);
  const start = parseMonth(startMonth);
  if (
    params.startAge !== undefined &&
    (!Number.isInteger(params.startAge) || params.startAge < 0)
  ) {
    throw new RangeError("startAge must be a completed age of zero or more.");
  }
  // `birthDate` is the canonical input. `startAge` is retained only as a
  // deprecated request alias and must never rewrite an explicit birth year.
  const birthYear = birth.year;
  const ageAtStart = ageInMonth(
    start.year,
    start.month,
    birthYear,
    birth.month,
  );
  if (ageAtStart < 0) {
    throw new RangeError("startMonth cannot be before birthDate.");
  }
  const endAge = params.endAge ?? CPF_LIFE_ELIGIBILITY_AGE;
  if (!Number.isInteger(endAge) || endAge < ageAtStart) {
    throw new RangeError(
      "endAge must be a whole number at or above the start age.",
    );
  }
  if (endAge > CPF_LIFE_LATEST_START_AGE) {
    throw new RangeError(
      `endAge cannot exceed ${CPF_LIFE_LATEST_START_AGE}. CPF LIFE premiums and payouts are not modelled in the ledger.`,
    );
  }
  if (!Number.isFinite(params.monthlyIncome) || params.monthlyIncome < 0) {
    throw new RangeError("monthlyIncome must be zero or more.");
  }
  validateMoney(params.housingWithdrawal, "housingWithdrawal");
  validateMoney(
    params.netSaSavingsWithdrawnForInvestments,
    "netSaSavingsWithdrawnForInvestments",
  );
  validateMoney(params.initialRaSavingsForLimits, "initialRaSavingsForLimits");
  validateMoney(
    params.initialRaSavingsForContributionRouting,
    "initialRaSavingsForContributionRouting",
  );
  validateMoney(
    params.initialCashTopUpTaxReliefUsedThisYear,
    "initialCashTopUpTaxReliefUsedThisYear",
  );
  validateMoney(params.voluntaryTopUp?.amount, "voluntaryTopUp.amount");
  validateMoney(params.retirementTransfer?.amount, "retirementTransfer.amount");
  validateMoney(params.oaToSaTransfer?.amount, "oaToSaTransfer.amount");

  const selfCashTopUpReliefCap =
    CPF_POLICY_RULES.retirementTopUps.taxRelief.selfAnnualCap;
  if (
    (params.initialCashTopUpTaxReliefUsedThisYear ?? 0) > selfCashTopUpReliefCap
  ) {
    throw new RangeError(
      `initialCashTopUpTaxReliefUsedThisYear cannot exceed S$${selfCashTopUpReliefCap.toLocaleString("en-SG")}.`,
    );
  }
  if (
    start.month === 1 &&
    (params.initialCashTopUpTaxReliefUsedThisYear ?? 0) > 0
  ) {
    throw new RangeError(
      "initialCashTopUpTaxReliefUsedThisYear must be zero for a January startMonth.",
    );
  }

  if (
    params.voluntaryTopUp &&
    !["retirement", "MA", "SA", "RA"].includes(params.voluntaryTopUp.account)
  ) {
    throw new RangeError(
      "voluntaryTopUp.account must be retirement, MA, SA or RA.",
    );
  }
  if (
    params.voluntaryTopUp &&
    !["monthly", "yearly"].includes(params.voluntaryTopUp.frequency)
  ) {
    throw new RangeError("voluntaryTopUp.frequency must be monthly or yearly.");
  }
  if (
    params.retirementTransfer &&
    !["now", "monthly", "yearly"].includes(params.retirementTransfer.timing)
  ) {
    throw new RangeError(
      "retirementTransfer.timing must be now, monthly or yearly.",
    );
  }
  if (
    params.oaToSaTransfer &&
    !["now", "yearly"].includes(params.oaToSaTransfer.timing)
  ) {
    throw new RangeError("oaToSaTransfer.timing must be now or yearly.");
  }
  const turns55AtStart =
    ageAtStart === RETIREMENT_ACCOUNT_AGE && start.month === birth.month;
  const raExistsAtOpening =
    ageAtStart > RETIREMENT_ACCOUNT_AGE ||
    (ageAtStart === RETIREMENT_ACCOUNT_AGE && !turns55AtStart);
  if (
    startMonth > SPECIAL_ACCOUNT_CLOSURE_MONTH &&
    raExistsAtOpening &&
    initialBalances.sa > 0
  ) {
    throw new RangeError(
      `A Special Account balance cannot exist at the opening of ${startMonth} for a member whose SA has closed. Enter the amount in RA or OA as shown on the CPF statement.`,
    );
  }
  if (!raExistsAtOpening && initialBalances.ra > 0) {
    throw new RangeError(
      `A Retirement Account balance cannot exist before age ${RETIREMENT_ACCOUNT_AGE}.`,
    );
  }
  if (!raExistsAtOpening && initialYearToDateAccruedInterest.ra > 0) {
    throw new RangeError(
      `Retirement Account accrued interest cannot exist before age ${RETIREMENT_ACCOUNT_AGE}.`,
    );
  }
  const openingAccruedInterestTotal = Object.values(
    initialYearToDateAccruedInterest,
  ).reduce((sum, amount) => sum + amount, 0);
  if (start.month === 1 && openingAccruedInterestTotal > 0) {
    throw new RangeError(
      "initialYearToDateAccruedInterest must be zero for a January startMonth.",
    );
  }
  if (
    start.month > 1 &&
    params.initialYearToDateAccruedInterest === undefined
  ) {
    addWarning(warnings, {
      code: "year-to-date-interest-defaulted",
      message:
        "The projection starts after January, but interest accrued before the start month was omitted and defaulted to zero. The first December credit and later balances exclude that unknown amount; provide initialYearToDateAccruedInterest from CPF records for a complete first year.",
    });
  }

  const isPermanentResident = params.citizenship !== "citizen";
  if (params.permanentResidentSince && !isPermanentResident) {
    throw new RangeError(
      "permanentResidentSince is only valid for a Permanent Resident projection.",
    );
  }
  if (
    params.permanentResidentSince &&
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(params.permanentResidentSince)
  ) {
    throw new RangeError("permanentResidentSince must be in YYYY-MM format.");
  }
  if (
    params.permanentResidentSince &&
    params.permanentResidentSince > startMonth
  ) {
    throw new RangeError("permanentResidentSince cannot be after startMonth.");
  }

  let resolvedCitizenshipAtStart: CitizenshipStatus = params.citizenship;
  if (params.permanentResidentSince) {
    resolvedCitizenshipAtStart = resolveSprContributionYear(
      `${params.permanentResidentSince}-01`,
      startMonth,
    );
    if (resolvedCitizenshipAtStart !== params.citizenship) {
      addWarning(warnings, {
        code: "pr-year-resolved-from-date",
        message: `The SPR contribution year was resolved from permanentResidentSince as ${resolvedCitizenshipAtStart}; the supplied ${params.citizenship} label was ignored.`,
      });
    }
  } else if (
    params.citizenship === "spr-year1" ||
    params.citizenship === "spr-year2"
  ) {
    addWarning(warnings, {
      code: "pr-anniversary-not-modelled",
      message:
        "Legacy SPR request: permanentResidentSince was omitted, so the selected graduated SPR year is held constant instead of transitioning after its anniversary.",
    });
  }

  const routing: RetirementRouting =
    params.retirementRouting ?? "full-retirement-sum";
  if (!params.retirementRouting && endAge >= RETIREMENT_ACCOUNT_AGE) {
    addWarning(warnings, {
      code: "retirement-routing-assumed",
      message: `No property context was supplied, so the age-${RETIREMENT_ACCOUNT_AGE} set-aside uses the Full Retirement Sum branch. Later contributions and MediSave overflow continue routing to RA until the cohort FRS.`,
    });
  }

  const retirementTransfer: RetirementTransfer | undefined =
    params.retirementTransfer ??
    (params.oaToSaTransfer
      ? {
          amount: params.oaToSaTransfer.amount,
          timing: params.oaToSaTransfer.timing,
        }
      : undefined);
  if (params.oaToSaTransfer) {
    addWarning(warnings, {
      code: "legacy-transfer-field",
      message: `oaToSaTransfer is deprecated. It was treated as an age-aware retirementTransfer to SA before ${RETIREMENT_ACCOUNT_AGE} or RA from ${RETIREMENT_ACCOUNT_AGE}.`,
    });
  }
  if (
    params.voluntaryTopUp?.account === "SA" ||
    params.voluntaryTopUp?.account === "RA"
  ) {
    addWarning(warnings, {
      code: "legacy-top-up-account",
      message: `The legacy SA/RA top-up destination was treated as an age-aware retirement top-up to SA before ${RETIREMENT_ACCOUNT_AGE} or RA from ${RETIREMENT_ACCOUNT_AGE}. Use account: retirement.`,
    });
  }
  if (
    params.voluntaryTopUp?.account === "MA" &&
    params.voluntaryTopUp.amount > 0
  ) {
    addWarning(warnings, {
      code: "ma-tax-relief-not-estimated",
      message: `MediSave top-up capacity is modelled against the BHS, but tax relief is not estimated because it depends on annual CPF contribution context beyond the S$${CPF_POLICY_RULES.retirementTopUps.taxRelief.selfAnnualCap.toLocaleString("en-SG")} retirement cash top-up cap.`,
    });
  }
  const hasRetirementCashTopUp =
    params.voluntaryTopUp !== undefined &&
    params.voluntaryTopUp.amount > 0 &&
    params.voluntaryTopUp.account !== "MA";
  if (
    hasRetirementCashTopUp &&
    start.month > 1 &&
    params.initialCashTopUpTaxReliefUsedThisYear === undefined
  ) {
    addWarning(warnings, {
      code: "tax-relief-year-to-date-defaulted",
      message:
        "Cash top-up tax relief already used earlier in the projection's start year was omitted and defaulted to zero, so that year's maximum potential relief may be overstated.",
    });
  }
  if (hasRetirementCashTopUp) {
    addWarning(warnings, {
      code: "tax-relief-eligibility-context-missing",
      message:
        "Reported cash top-up relief is only a maximum potential amount. It does not determine MRSS matching-grant status, giver and recipient eligibility, shared MediSave usage, or the overall personal income-tax relief cap; top-ups attracting MRSS grants receive no cash top-up relief.",
    });
  }
  const hasRetirementAddition =
    (params.voluntaryTopUp !== undefined &&
      params.voluntaryTopUp.amount > 0 &&
      params.voluntaryTopUp.account !== "MA") ||
    (retirementTransfer !== undefined && retirementTransfer.amount > 0);
  if (
    hasRetirementAddition &&
    ageAtStart < RETIREMENT_ACCOUNT_AGE &&
    params.netSaSavingsWithdrawnForInvestments === undefined
  ) {
    addWarning(warnings, {
      code: "retirement-top-up-capacity-context-missing",
      message: `Below age ${RETIREMENT_ACCOUNT_AGE}, net SA savings withdrawn for investments count towards the FRS limit. That context was omitted and defaulted to zero, so the modelled retirement top-up or transfer capacity may be overstated.`,
    });
  }
  addWarning(warnings, {
    code: "cpf-life-estimate-removed",
    message: `The deprecated CPF LIFE estimate is null. From age ${CPF_LIFE_ELIGIBILITY_AGE}, the ledger is a pre-CPF-LIFE illustration that does not deduct premiums or payouts. An endAge of ${CPF_LIFE_LATEST_START_AGE} stops immediately before the birthday month when payouts must start and records an opening checkpoint only. Use CPF Board's exact reference rows or personalised Retirement Payout Planner.`,
  });

  const cohort = getCohortRetirementThresholds(
    `${birthYear + RETIREMENT_ACCOUNT_AGE}-${String(birth.month).padStart(2, "0")}`,
  );
  const cohortFrs = toCents(cohort.frs);
  const age55RoutingThreshold = toCents(
    routing === "basic-retirement-sum-with-property" ? cohort.brs : cohort.frs,
  );
  const startSerial = monthSerial(start.year, start.month);
  const endSerial =
    endAge === CPF_LIFE_LATEST_START_AGE
      ? monthSerial(birthYear + CPF_LIFE_LATEST_START_AGE, birth.month) - 1
      : monthSerial(birthYear + endAge + 1, birth.month) - 1;
  if (endSerial < startSerial) {
    throw new RangeError("The selected endAge ends before startMonth.");
  }
  const additionalWagesByMonth = prepareAdditionalWages(
    params.additionalWages,
    startSerial,
    endSerial,
  );

  const balances = balancesToCents(initialBalances);
  if (!raExistsAtOpening && (params.initialRaSavingsForLimits ?? 0) > 0) {
    throw new RangeError(
      `initialRaSavingsForLimits cannot exist before age ${RETIREMENT_ACCOUNT_AGE}.`,
    );
  }
  if (
    !raExistsAtOpening &&
    (params.initialRaSavingsForContributionRouting ?? 0) > 0
  ) {
    throw new RangeError(
      `initialRaSavingsForContributionRouting cannot exist before age ${RETIREMENT_ACCOUNT_AGE}.`,
    );
  }
  const defaultRaSavingsForLimits =
    raExistsAtOpening &&
    routing === "basic-retirement-sum-with-property" &&
    !turns55AtStart
      ? Math.max(toCents(initialBalances.ra), cohortFrs)
      : toCents(initialBalances.ra);
  const raSavings: RaSavingsState = {
    forLimits:
      params.initialRaSavingsForLimits === undefined
        ? defaultRaSavingsForLimits
        : toCents(params.initialRaSavingsForLimits),
    forContributionRouting:
      params.initialRaSavingsForContributionRouting === undefined
        ? toCents(initialBalances.ra)
        : toCents(params.initialRaSavingsForContributionRouting),
  };
  if (
    raExistsAtOpening &&
    (params.initialRaSavingsForLimits === undefined ||
      params.initialRaSavingsForContributionRouting === undefined)
  ) {
    addWarning(warnings, {
      code: "retirement-account-context-defaulted",
      message:
        routing === "basic-retirement-sum-with-property"
          ? "One or both RA routing contexts were omitted. The property branch assumes the cohort FRS has previously been set aside for top-up and MediSave-overflow limits, while employment-contribution routing defaults to the opening RA cash balance."
          : "One or both RA routing contexts were omitted and defaulted to the opening RA balance. CPF uses distinct principal measures that can exclude interest or grants and include counted withdrawals or CPF LIFE premiums, so routing and top-up capacity may differ.",
    });
  }
  if (
    raExistsAtOpening &&
    routing === "basic-retirement-sum-with-property" &&
    !turns55AtStart &&
    raSavings.forLimits < cohortFrs
  ) {
    throw new RangeError(
      "The property withdrawal branch requires initialRaSavingsForLimits to show that the cohort FRS was set aside.",
    );
  }
  if (routing === "basic-retirement-sum-with-property") {
    addWarning(warnings, {
      code: "property-withdrawal-context-simplified",
      message:
        "The property branch assumes CPF approves an RA withdrawal down to BRS and that eligible property value, refunds or a pledge cover the FRS gap. Actual withdrawal excludes restricted savings such as interest, grants and retirement top-ups and must be confirmed with CPF Board.",
    });
  }
  const netSaInvestmentWithdrawals = toCents(
    params.netSaSavingsWithdrawnForInvestments ?? 0,
  );
  let saClosed =
    startMonth >= SPECIAL_ACCOUNT_CLOSURE_MONTH && raExistsAtOpening;

  const yearlyBalances: YearlyBalance[] = [];
  const milestones: ProjectionResult["milestones"] = {};
  let accruedInterest = emptyInterest();
  accruedInterest.base = balancesToCents(initialYearToDateAccruedInterest);
  let accumulator = emptyYearAccumulator();
  let totalContributed = 0;
  let totalInterestEarned = 0;
  let taxReliefYear = start.year;
  let taxReliefUsed = toCents(
    params.initialCashTopUpTaxReliefUsedThisYear ?? 0,
  );
  let lastPolicy: MonthPolicy | undefined;
  let accumulatedPolicy: ProjectionPolicyMetadata | undefined;
  let lastAgeGroup = "";

  for (let serial = startSerial; serial <= endSerial; serial++) {
    const { year, month } = monthFromSerial(serial);
    const actualMonth = formatMonth(year, month);
    const age = ageInMonth(year, month, birthYear, birth.month);
    const isFirstMonth = serial === startSerial;
    const isBirthdayMonth = month === birth.month;
    const isAnniversaryMonth = month === start.month;

    if (taxReliefYear !== year) {
      taxReliefYear = year;
      taxReliefUsed = 0;
    }

    const turns55ThisMonth = isBirthdayMonth && age === RETIREMENT_ACCOUNT_AGE;
    let pendingAgeRouting = emptyBalances();
    if (isFirstMonth && saClosed && !turns55ThisMonth) {
      pendingAgeRouting = prepareSpecialAccountClosure(
        balances,
        age55RoutingThreshold,
        raSavings,
      );
    }
    if (turns55ThisMonth) {
      const closeSa = actualMonth >= SPECIAL_ACCOUNT_CLOSURE_MONTH;
      const accountCreation = prepareAge55AccountCreation(
        balances,
        cohortFrs,
        age55RoutingThreshold,
        closeSa,
        raSavings,
      );
      pendingAgeRouting = accountCreation.pending;
      accumulator.propertyPledgeWithdrawal +=
        accountCreation.propertyPledgeWithdrawal;
      saClosed = closeSa;
    }
    if (
      actualMonth === SPECIAL_ACCOUNT_CLOSURE_MONTH &&
      age >= RETIREMENT_ACCOUNT_AGE &&
      !saClosed
    ) {
      pendingAgeRouting = prepareSpecialAccountClosure(
        balances,
        age55RoutingThreshold,
        raSavings,
      );
      saClosed = true;
    }

    addBalances(balances, pendingAgeRouting);
    const interestBalances = { ...balances };

    const currentRetirement = getRetirementSumsForProjection(year);
    const currentFrs = toCents(currentRetirement.value.frs);
    const currentErs = toCents(currentRetirement.value.ers);
    const currentBhs = getBhsForProjection(year, birthYear);
    const bhs = toCents(currentBhs.value);
    const maBeforeOverflow = balances.ma;
    const openingMaOverflowDistribution = enforceBhs(
      balances,
      bhs,
      age,
      currentFrs,
      age55RoutingThreshold,
      netSaInvestmentWithdrawals,
      raSavings,
    );
    interestBalances.ma = Math.max(
      0,
      interestBalances.ma - (maBeforeOverflow - balances.ma),
    );
    // This is an existing-balance transfer, so the overflow earns interest in
    // its destination account for the transfer month instead of disappearing
    // from the month's interest-bearing snapshot.
    addBalances(interestBalances, openingMaOverflowDistribution);

    const housingWithdrawal = Math.min(
      balances.oa,
      Math.max(0, toCents(params.housingWithdrawal ?? 0)),
    );
    balances.oa -= housingWithdrawal;
    interestBalances.oa = Math.max(0, interestBalances.oa - housingWithdrawal);
    accumulator.housingWithdrawal += housingWithdrawal;

    const preparedTransfer = prepareRetirementTransfer(
      balances,
      retirementTransfer,
      isFirstMonth,
      isAnniversaryMonth,
      age,
      currentFrs,
      currentErs,
      netSaInvestmentWithdrawals,
      raSavings,
    );
    interestBalances.oa = Math.max(
      0,
      interestBalances.oa - preparedTransfer.existingSavings,
    );
    finishRetirementTransfer(
      interestBalances,
      preparedTransfer.existingSavings,
      age,
    );

    const monthlyInterestPolicy = resolveMonthlyInterestPolicy(actualMonth);
    const monthlyInterest = calculateMonthlyInterest(
      interestBalances,
      age,
      monthlyInterestPolicy.rates,
    );
    addInterest(accruedInterest, monthlyInterest);
    addInterest(accumulator.reportedInterest, monthlyInterest);
    totalInterestEarned +=
      monthlyInterest.base.oa +
      monthlyInterest.base.sa +
      monthlyInterest.base.ma +
      monthlyInterest.base.ra +
      monthlyInterest.extraTotal;

    finishRetirementTransfer(balances, preparedTransfer.existingSavings, age);
    if (age >= RETIREMENT_ACCOUNT_AGE) {
      raSavings.forLimits += preparedTransfer.existingSavings;
      raSavings.forContributionRouting += preparedTransfer.existingSavings;
    }
    accumulator.retirementTransfer += preparedTransfer.existingSavings;

    const contributionCitizenship = params.permanentResidentSince
      ? resolveSprContributionYear(
          `${params.permanentResidentSince}-01`,
          actualMonth,
        )
      : resolvedCitizenshipAtStart;
    const additionalWage = additionalWagesByMonth.get(actualMonth);
    const contribution = calculateCpfContributionForProjection({
      contributionMonth: actualMonth,
      ordinaryWages: params.monthlyIncome,
      ...(additionalWage
        ? {
            additionalWages: additionalWage.amount,
            additionalWageCeilingContext: additionalWage.context,
          }
        : {}),
      citizenship: contributionCitizenship,
      birthMonth: formatMonth(birthYear, birth.month),
      hasReachedFullRetirementSum:
        raSavings.forContributionRouting >= cohortFrs,
    });
    for (const contributionWarning of contribution.warnings) {
      if (contributionWarning.code === "additional-wages-capped") {
        addWarning(warnings, {
          code: "additional-wages-capped",
          message: contributionWarning.message,
        });
      }
    }
    const policy = monthPolicy(
      year,
      birthYear,
      contribution,
      cohort.metadata,
      monthlyInterestPolicy.metadata,
      hasRetirementAddition,
      hasRetirementCashTopUp,
      params.voluntaryTopUp?.account === "MA" &&
        (params.voluntaryTopUp.amount ?? 0) > 0,
    );
    lastPolicy = policy;
    accumulatedPolicy = accumulatedPolicy
      ? mergeProjectionPolicyMetadata(accumulatedPolicy, policy.projection)
      : policy.projection;
    lastAgeGroup = describeAgeGroup(contribution);
    if (policy.projection.status === "assumed") {
      addWarning(warnings, {
        code: "future-policy-frozen",
        message: `One or more policy inputs are assumptions: unpublished future values are frozen at their last sourced row, while a requested historical top-up may use the catalogue's ${RETIREMENT_TOP_UP_POLICY_YEAR} retirement-top-up and ${TAX_RELIEF_POLICY_YEAR} tax-relief rules as an explicit backcast. Inspect each dataset's status and notes in the row metadata.`,
      });
    }

    const distribution = applyContribution(
      balances,
      contribution,
      age,
      saClosed,
      bhs,
      currentFrs,
      cohortFrs,
      age55RoutingThreshold,
      netSaInvestmentWithdrawals,
      raSavings,
    );
    addBalances(accumulator.distribution, distribution);
    const employee = toCents(contribution.contribution.employee);
    const employer = toCents(contribution.contribution.employer);
    const total = toCents(contribution.contribution.totalContribution);
    accumulator.employee += employee;
    accumulator.employer += employer;
    accumulator.total += total;
    totalContributed += total;

    const freshTransfer = applyFreshRetirementTransfer(
      balances,
      preparedTransfer.freshSavingsRequested,
      age,
      currentFrs,
      currentErs,
      netSaInvestmentWithdrawals,
      raSavings,
    );
    accumulator.retirementTransfer += freshTransfer;

    const topUp = applyVoluntaryTopUp(
      balances,
      params.voluntaryTopUp,
      isFirstMonth,
      isAnniversaryMonth,
      age,
      bhs,
      currentFrs,
      currentErs,
      netSaInvestmentWithdrawals,
      taxReliefUsed,
      raSavings,
    );
    accumulator.voluntaryTopUp += topUp.amount;
    accumulator.topUpPotentialTaxRelief += topUp.potentialTaxRelief;
    accumulator.unappliedVoluntaryTopUp += topUp.unappliedAmount;
    taxReliefUsed += topUp.potentialTaxRelief;
    if (topUp.unappliedAmount > 0 && params.voluntaryTopUp?.account === "MA") {
      addWarning(warnings, {
        code: "medisave-top-up-rejected",
        message:
          "A MediSave top-up that would exceed the applicable BHS is rejected in full; the rejected amount is reported separately and is not added to MA.",
      });
    }
    if (topUp.unappliedAmount > 0 && params.voluntaryTopUp?.account !== "MA") {
      addWarning(warnings, {
        code: "retirement-top-up-capped",
        message:
          "The requested retirement cash top-up exceeded the available FRS/ERS capacity. Only the available amount was applied and the unapplied amount is reported separately.",
      });
    }

    enforceBhs(
      balances,
      bhs,
      age,
      currentFrs,
      age55RoutingThreshold,
      netSaInvestmentWithdrawals,
      raSavings,
    );

    if (month === 12) {
      creditAnnualInterest(
        balances,
        accruedInterest,
        saClosed,
        age55RoutingThreshold,
        raSavings,
      );
      accruedInterest = emptyInterest();
      enforceBhs(
        balances,
        bhs,
        age,
        currentFrs,
        age55RoutingThreshold,
        netSaInvestmentWithdrawals,
        raSavings,
      );
    }

    if (isBirthdayMonth && age === RETIREMENT_ACCOUNT_AGE) {
      milestones.age55 = balancesFromCents(balances);
    }
    if (isBirthdayMonth && age === CPF_LIFE_ELIGIBILITY_AGE) {
      milestones.age65 = balancesFromCents(balances);
    }
    if (isBirthdayMonth && age === CPF_LIFE_LATEST_START_AGE) {
      milestones.age70 = balancesFromCents(balances);
    }

    const isFinalMonth = serial === endSerial;
    if (month === 12 || isFinalMonth) {
      if (!lastPolicy) {
        throw new Error("Projection policy metadata was not resolved.");
      }
      yearlyBalances.push({
        year,
        month: actualMonth,
        age,
        ageGroup: lastAgeGroup,
        balances: balancesFromCents(balances),
        contributions: {
          employee: fromCents(accumulator.employee),
          employer: fromCents(accumulator.employer),
          total: fromCents(accumulator.total),
        },
        distribution: {
          oa: fromCents(accumulator.distribution.oa),
          sa: fromCents(accumulator.distribution.sa),
          ma: fromCents(accumulator.distribution.ma),
          ra: fromCents(accumulator.distribution.ra),
        },
        interestEarned: {
          oa: fromCents(accumulator.reportedInterest.base.oa),
          sa: fromCents(accumulator.reportedInterest.base.sa),
          ma: fromCents(accumulator.reportedInterest.base.ma),
          ra: fromCents(accumulator.reportedInterest.base.ra),
          extraInterest: fromCents(accumulator.reportedInterest.extraTotal),
        },
        ...(Object.values(interestDestinationBalances(accruedInterest)).some(
          (amount) => amount > 0,
        )
          ? {
              uncreditedInterest: balancesFromCents(
                interestDestinationBalances(accruedInterest),
              ),
            }
          : {}),
        ...(accumulator.housingWithdrawal > 0
          ? {
              housingWithdrawal: fromCents(accumulator.housingWithdrawal),
            }
          : {}),
        ...(accumulator.voluntaryTopUp > 0
          ? { voluntaryTopUp: fromCents(accumulator.voluntaryTopUp) }
          : {}),
        ...(accumulator.retirementTransfer > 0
          ? {
              retirementTransfer: fromCents(accumulator.retirementTransfer),
            }
          : {}),
        ...(accumulator.propertyPledgeWithdrawal > 0
          ? {
              propertyPledgeWithdrawal: fromCents(
                accumulator.propertyPledgeWithdrawal,
              ),
            }
          : {}),
        ...(accumulator.unappliedVoluntaryTopUp > 0
          ? {
              unappliedVoluntaryTopUp: fromCents(
                accumulator.unappliedVoluntaryTopUp,
              ),
            }
          : {}),
        ...(accumulator.topUpPotentialTaxRelief > 0
          ? {
              topUpPotentialTaxRelief: fromCents(
                accumulator.topUpPotentialTaxRelief,
              ),
            }
          : {}),
        raSavingsForLimits: fromCents(raSavings.forLimits),
        raSavingsForContributionRouting: fromCents(
          raSavings.forContributionRouting,
        ),
        bhs: policy.bhs.value,
        retirementSums: policy.retirement.value,
        policy: accumulatedPolicy ?? lastPolicy.projection,
      });
      accumulator = emptyYearAccumulator();
      accumulatedPolicy = undefined;
    }
  }

  if (endAge === CPF_LIFE_LATEST_START_AGE) {
    milestones.age70 = balancesFromCents(balances);
  }

  return {
    input: params,
    yearlyBalances,
    milestones,
    cpfLifeReference: CPF_LIFE_2026_REFERENCE,
    cpfLifeEstimate: null,
    warnings: [...warnings.values()],
    assumptions: {
      salary: "fixed-monthly-ordinary-wages",
      additionalWages: "explicit-dated-payments-only",
      interest: "official-quarterly-then-floor-assumption",
      futurePolicy: "freeze-last-published",
      startingBalances: "opening-of-start-month",
      initialYearToDateInterest: "provided-or-zero-with-warning",
      topUpTiming: "after-monthly-employment-contribution",
      cpfLife: "premiums-and-payouts-not-modelled",
      retirementRouting: routing,
    },
    totalContributed: fromCents(totalContributed),
    totalInterestEarned: fromCents(totalInterestEarned),
  };
}
