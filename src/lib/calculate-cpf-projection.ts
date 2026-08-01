import { type BhsPolicyValue, getBhsForProjection } from "@/constants/cpf-bhs";
import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";
import { CPF_LIFE_2026_REFERENCE } from "@/constants/cpf-life";
import {
  getCohortRetirementThresholds,
  getRetirementSumsForProjection,
  type RetirementSumsPolicyValue,
} from "@/constants/cpf-retirement-sums";
import { calculateCpfContributionForProjection } from "@/lib/calculate-cpf-contribution";
import type {
  ContributionCalculationResult,
  PolicyMetadata,
  PolicyStatus,
} from "@/policy";
import { CPF_POLICY_RULES, getPolicyMetadata } from "@/policy";
import type {
  AccountBalances,
  ProjectionParams,
  ProjectionPolicyMetadata,
  ProjectionResult,
  ProjectionWarning,
  RetirementRouting,
  RetirementTransfer,
  VoluntaryTopUp,
  YearlyBalance,
} from "@/types";

const LAST_PUBLISHED_INTEREST_YEAR = 2026;

interface CentsBalances {
  oa: number;
  sa: number;
  ma: number;
  ra: number;
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
  topUpTaxReliefEligible: number;
  retirementTransfer: number;
}

interface MonthPolicy {
  bhs: BhsPolicyValue;
  retirement: RetirementSumsPolicyValue;
  projection: ProjectionPolicyMetadata;
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

function emptyYearAccumulator(): YearAccumulator {
  return {
    employee: 0,
    employer: 0,
    total: 0,
    distribution: emptyBalances(),
    reportedInterest: emptyInterest(),
    housingWithdrawal: 0,
    voluntaryTopUp: 0,
    topUpTaxReliefEligible: 0,
    retirementTransfer: 0,
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

function ageInMonth(
  year: number,
  month: number,
  birthYear: number,
  birthMonth: number,
): number {
  return year - birthYear - (month < birthMonth ? 1 : 0);
}

function contributionAgeInMonth(
  year: number,
  month: number,
  birthYear: number,
  birthMonth: number,
): number {
  const completedAge = ageInMonth(year, month, birthYear, birthMonth);
  return month === birthMonth ? Math.max(0, completedAge - 1) : completedAge;
}

function describeAgeGroup(age: number): string {
  if (age <= 35) return "35 and below";
  if (age <= 45) return "Above 35 to 45";
  if (age <= 50) return "Above 45 to 50";
  if (age <= 55) return "Above 50 to 55";
  if (age <= 60) return "Above 55 to 60";
  if (age <= 65) return "Above 60 to 65";
  if (age <= 70) return "Above 65 to 70";
  return "Above 70";
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
): CentsBalances {
  const distribution = emptyBalances();
  if (amount <= 0) return distribution;

  if (age < 55) {
    balances.sa += amount;
    distribution.sa = amount;
    return distribution;
  }

  const raSpace = Math.max(0, retirementThreshold - balances.ra);
  const toRa = Math.min(amount, raSpace);
  const toOa = amount - toRa;
  balances.ra += toRa;
  balances.oa += toOa;
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
): CentsBalances {
  const distribution = emptyBalances();
  if (overflow <= 0) return distribution;

  if (age < 55) {
    const saSpace = Math.max(0, under55Frs - balances.sa);
    const toSa = Math.min(overflow, saSpace);
    const toOa = overflow - toSa;
    balances.sa += toSa;
    balances.oa += toOa;
    distribution.sa = toSa;
    distribution.oa = toOa;
    return distribution;
  }

  return routeToRetirement(balances, overflow, age, retirementThreshold);
}

function enforceBhs(
  balances: CentsBalances,
  bhs: number,
  age: number,
  under55Frs: number,
  retirementThreshold: number,
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
  );
}

function applyAge55AccountCreation(
  balances: CentsBalances,
  retirementThreshold: number,
  closeSa: boolean,
): void {
  const raSpaceBeforeSa = Math.max(0, retirementThreshold - balances.ra);
  const fromSa = Math.min(balances.sa, raSpaceBeforeSa);
  balances.sa -= fromSa;
  balances.ra += fromSa;

  const raSpaceBeforeOa = Math.max(0, retirementThreshold - balances.ra);
  const fromOa = Math.min(balances.oa, raSpaceBeforeOa);
  balances.oa -= fromOa;
  balances.ra += fromOa;

  if (closeSa && balances.sa > 0) {
    balances.oa += balances.sa;
    balances.sa = 0;
  }
}

function applySpecialAccountClosure(
  balances: CentsBalances,
  cohortFrs: number,
): void {
  const toRa = Math.min(
    balances.sa,
    Math.max(0, cohortFrs - balances.ra),
  );
  balances.sa -= toRa;
  balances.ra += toRa;
  balances.oa += balances.sa;
  balances.sa = 0;
}

function calculateMonthlyInterest(
  balances: CentsBalances,
  age: number,
): InterestAccrual {
  const rules = CPF_POLICY_RULES.extraInterest;
  const accrual = emptyInterest();
  accrual.base.oa = Math.round(
    (balances.oa * (CPF_INTEREST_FLOOR_RATES.OA / 100)) / 12,
  );
  accrual.base.sa = Math.round(
    (balances.sa * (CPF_INTEREST_FLOOR_RATES.SMRA / 100)) / 12,
  );
  accrual.base.ma = Math.round(
    (balances.ma * (CPF_INTEREST_FLOOR_RATES.SMRA / 100)) / 12,
  );
  accrual.base.ra = Math.round(
    (balances.ra * (CPF_INTEREST_FLOOR_RATES.SMRA / 100)) / 12,
  );

  let combinedUsed = 0;
  const orderedAccounts: (keyof CentsBalances)[] = ["ra", "oa", "sa", "ma"];

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
    if (age >= 55) {
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
      if (age >= 55) accrual.extraDestination.ra += interest;
      else accrual.extraDestination.sa += interest;
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
): void {
  balances.oa += accrual.base.oa + accrual.extraDestination.oa;
  balances.ma += accrual.base.ma + accrual.extraDestination.ma;
  balances.ra += accrual.base.ra + accrual.extraDestination.ra;

  const saCredit = accrual.base.sa + accrual.extraDestination.sa;
  if (saClosed) {
    routeToRetirement(balances, saCredit, 55, retirementThreshold);
  } else {
    balances.sa += saCredit;
  }
}

function shouldApplyFrequency(
  frequency: "monthly" | "yearly",
  month: number,
  isFirstMonth: boolean,
): boolean {
  return frequency === "monthly" || isFirstMonth || month === 1;
}

function shouldApplyTransfer(
  timing: RetirementTransfer["timing"],
  month: number,
  isFirstMonth: boolean,
): boolean {
  if (timing === "monthly") return true;
  if (timing === "now") return isFirstMonth;
  return isFirstMonth || month === 1;
}

function prepareRetirementTransfer(
  balances: CentsBalances,
  transfer: RetirementTransfer | undefined,
  month: number,
  isFirstMonth: boolean,
  age: number,
  currentFrs: number,
  currentErs: number,
): number {
  if (
    !transfer ||
    transfer.amount <= 0 ||
    !shouldApplyTransfer(transfer.timing, month, isFirstMonth)
  ) {
    return 0;
  }

  const targetBalance = age < 55 ? balances.sa : balances.ra;
  const targetLimit = age < 55 ? currentFrs : currentErs;
  const targetSpace = Math.max(0, targetLimit - targetBalance);
  const amount = Math.min(toCents(transfer.amount), balances.oa, targetSpace);
  balances.oa -= amount;
  return amount;
}

function finishRetirementTransfer(
  balances: CentsBalances,
  amount: number,
  age: number,
): void {
  if (age < 55) balances.sa += amount;
  else balances.ra += amount;
}

function applyVoluntaryTopUp(
  balances: CentsBalances,
  topUp: VoluntaryTopUp | undefined,
  month: number,
  isFirstMonth: boolean,
  age: number,
  bhs: number,
  currentFrs: number,
  currentErs: number,
  taxReliefUsed: number,
): { amount: number; taxReliefEligible: number } {
  if (
    !topUp ||
    topUp.amount <= 0 ||
    !shouldApplyFrequency(topUp.frequency, month, isFirstMonth)
  ) {
    return { amount: 0, taxReliefEligible: 0 };
  }

  const requested = toCents(topUp.amount);
  const remainingTaxRelief = Math.max(
    0,
    toCents(CPF_POLICY_RULES.retirementTopUps.taxRelief.selfAnnualCap) -
      taxReliefUsed,
  );

  if (topUp.account === "MA") {
    const capacity = Math.max(0, bhs - balances.ma);
    const amount = Math.min(requested, capacity);
    balances.ma += amount;
    return {
      amount,
      taxReliefEligible: Math.min(amount, remainingTaxRelief),
    };
  }

  const destinationBalance = age < 55 ? balances.sa : balances.ra;
  const actualLimit = age < 55 ? currentFrs : currentErs;
  const reliefLimit = currentFrs;
  const amount = Math.min(
    requested,
    Math.max(0, actualLimit - destinationBalance),
  );
  const taxReliefEligible = Math.min(
    amount,
    Math.max(0, reliefLimit - destinationBalance),
    remainingTaxRelief,
  );

  if (age < 55) balances.sa += amount;
  else balances.ra += amount;
  return { amount, taxReliefEligible };
}

function applyContribution(
  balances: CentsBalances,
  calculation: ContributionCalculationResult,
  age: number,
  saClosed: boolean,
  bhs: number,
  currentFrs: number,
  retirementThreshold: number,
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
    retirementThreshold,
  );
  addBalances(allocated, overflow);

  if (saClosed || calculation.distribution.RA !== undefined) {
    const routed = routeToRetirement(
      balances,
      retirement,
      Math.max(55, age),
      retirementThreshold,
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

function interestMetadata(year: number): PolicyMetadata {
  if (year <= LAST_PUBLISHED_INTEREST_YEAR) {
    return getPolicyMetadata("cpf-interest-rates", {
      version: `${year}-floor-rates`,
      effectiveFrom: `${year}-01-01`,
      effectiveTo: `${year}-12-31`,
      notes: [
        "Projection preset uses the official 2.5% OA and 4% SMRA floor rates.",
      ],
    });
  }

  return getPolicyMetadata("cpf-interest-rates", {
    version: `${year}-freeze-2026`,
    status: "assumed",
    effectiveFrom: `${year}-01-01`,
    effectiveTo: `${year}-12-31`,
    notes: [
      "The 2.5% OA and 4% SMRA floor-rate preset is held constant after the last published projection year.",
    ],
  });
}

function monthPolicy(
  year: number,
  birthYear: number,
  contribution: ContributionCalculationResult,
): MonthPolicy {
  const bhs = getBhsForProjection(year, birthYear);
  const retirement = getRetirementSumsForProjection(year);
  const contributionMetadata = contribution.policy.contribution;
  const allocationMetadata = contribution.policy.allocation;
  const wageCeilingMetadata = contribution.policy.wageCeiling;
  const interest = interestMetadata(year);
  const statuses: PolicyStatus[] = [
    contributionMetadata.status,
    allocationMetadata.status,
    wageCeilingMetadata.status,
    bhs.metadata.status,
    retirement.metadata.status,
    interest.status,
  ];

  return {
    bhs,
    retirement,
    projection: {
      status: statuses.includes("assumed") ? "assumed" : "official",
      contribution: contributionMetadata,
      allocation: allocationMetadata,
      wageCeiling: wageCeilingMetadata,
      bhs: bhs.metadata,
      retirementSums: retirement.metadata,
      interest,
    },
  };
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
  const now = new Date();
  const startMonth =
    params.startMonth ?? formatMonth(now.getFullYear(), now.getMonth() + 1);
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

  const birth = parseBirthDate(params.birthDate);
  const start = parseMonth(startMonth);
  const inferredBirthYear =
    params.startAge === undefined
      ? birth.year
      : start.year - params.startAge - (start.month < birth.month ? 1 : 0);
  const birthYear = inferredBirthYear;
  const ageAtStart = ageInMonth(
    start.year,
    start.month,
    birthYear,
    birth.month,
  );
  if (ageAtStart < 0) {
    throw new RangeError("startMonth cannot be before birthDate.");
  }
  const endAge = params.endAge ?? 65;
  if (!Number.isInteger(endAge) || endAge < ageAtStart) {
    throw new RangeError(
      "endAge must be a whole number at or above the start age.",
    );
  }
  if (!Number.isFinite(params.monthlyIncome) || params.monthlyIncome < 0) {
    throw new RangeError("monthlyIncome must be zero or more.");
  }
  if (ageAtStart < 55 && initialBalances.ra > 0) {
    throw new RangeError(
      "A Retirement Account balance cannot exist before age 55.",
    );
  }

  const routing: RetirementRouting =
    params.retirementRouting ?? "full-retirement-sum";
  if (!params.retirementRouting) {
    addWarning(warnings, {
      code: "retirement-routing-assumed",
      message:
        "No property context was supplied, so age-55 and post-55 routing uses the Full Retirement Sum branch.",
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
      message:
        "oaToSaTransfer is deprecated. It was treated as an age-aware retirementTransfer to SA before 55 or RA from 55.",
    });
  }
  addWarning(warnings, {
    code: "cpf-life-estimate-removed",
    message:
      "The deprecated CPF LIFE estimate is null. Use CPF Board's exact reference rows or personalised Retirement Payout Planner.",
  });

  const cohort = getCohortRetirementThresholds(birthYear + 55);
  const cohortFrs = toCents(cohort.frs);
  const age55RoutingThreshold = toCents(
    routing === "basic-retirement-sum-with-property" ? cohort.brs : cohort.frs,
  );
  const startSerial = monthSerial(start.year, start.month);
  const endSerial = monthSerial(birthYear + endAge + 1, birth.month) - 1;
  if (endSerial < startSerial) {
    throw new RangeError("The selected endAge ends before startMonth.");
  }

  const balances = balancesToCents(initialBalances);
  let saClosed = false;
  if (startMonth >= "2025-01" && ageAtStart >= 55) {
    applySpecialAccountClosure(balances, cohortFrs);
    saClosed = true;
  }

  const yearlyBalances: YearlyBalance[] = [];
  const milestones: ProjectionResult["milestones"] = {
    age55: { oa: 0, sa: 0, ma: 0, ra: 0 },
    age65: { oa: 0, sa: 0, ma: 0, ra: 0 },
  };
  let accruedInterest = emptyInterest();
  let accumulator = emptyYearAccumulator();
  let totalContributed = 0;
  let totalInterestEarned = 0;
  let taxReliefYear = start.year;
  let taxReliefUsed = 0;
  let lastPolicy: MonthPolicy | undefined;
  let lastAgeGroup = "";

  for (let serial = startSerial; serial <= endSerial; serial++) {
    const { year, month } = monthFromSerial(serial);
    const actualMonth = formatMonth(year, month);
    const age = ageInMonth(year, month, birthYear, birth.month);
    const contributionAge = contributionAgeInMonth(
      year,
      month,
      birthYear,
      birth.month,
    );
    const isFirstMonth = serial === startSerial;
    const isBirthdayMonth = month === birth.month;

    if (taxReliefYear !== year) {
      taxReliefYear = year;
      taxReliefUsed = 0;
    }

    const turns55ThisMonth = isBirthdayMonth && age === 55;
    if (turns55ThisMonth) {
      const closeSa = actualMonth >= "2025-01";
      applyAge55AccountCreation(
        balances,
        age55RoutingThreshold,
        closeSa,
      );
      saClosed = closeSa;
    }
    if (actualMonth === "2025-01" && age >= 55 && !saClosed) {
      applySpecialAccountClosure(balances, cohortFrs);
      saClosed = true;
    }

    const currentRetirement = getRetirementSumsForProjection(year);
    const currentFrs = toCents(currentRetirement.value.frs);
    const currentErs = toCents(currentRetirement.value.ers);
    const currentBhs = getBhsForProjection(year, birthYear);
    const bhs = toCents(currentBhs.value);
    const overflowBeforeTransactions = enforceBhs(
      balances,
      bhs,
      age,
      currentFrs,
      cohortFrs,
    );
    addBalances(accumulator.distribution, overflowBeforeTransactions);

    const housingWithdrawal = Math.min(
      balances.oa,
      Math.max(0, toCents(params.housingWithdrawal ?? 0)),
    );
    balances.oa -= housingWithdrawal;
    accumulator.housingWithdrawal += housingWithdrawal;

    const transferAmount = prepareRetirementTransfer(
      balances,
      retirementTransfer,
      month,
      isFirstMonth,
      age,
      currentFrs,
      currentErs,
    );

    const monthlyInterest = calculateMonthlyInterest(balances, age);
    addInterest(accruedInterest, monthlyInterest);
    addInterest(accumulator.reportedInterest, monthlyInterest);
    totalInterestEarned +=
      monthlyInterest.base.oa +
      monthlyInterest.base.sa +
      monthlyInterest.base.ma +
      monthlyInterest.base.ra +
      monthlyInterest.extraTotal;

    finishRetirementTransfer(balances, transferAmount, age);
    accumulator.retirementTransfer += transferAmount;

    const contribution = calculateCpfContributionForProjection({
      contributionMonth: actualMonth,
      ordinaryWages: params.monthlyIncome,
      citizenship: params.citizenship,
      age: contributionAge,
      hasReachedFullRetirementSum: balances.ra >= cohortFrs,
    });
    const policy = monthPolicy(year, birthYear, contribution);
    lastPolicy = policy;
    lastAgeGroup = describeAgeGroup(contributionAge);
    if (policy.projection.status === "assumed") {
      addWarning(warnings, {
        code: "future-policy-frozen",
        message:
          "One or more unpublished future values are held at the last published contribution, BHS, retirement-sum or interest policy and marked assumed in each row.",
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
    );
    addBalances(accumulator.distribution, distribution);
    const employee = toCents(contribution.contribution.employee);
    const employer = toCents(contribution.contribution.employer);
    const total = toCents(contribution.contribution.totalContribution);
    accumulator.employee += employee;
    accumulator.employer += employer;
    accumulator.total += total;
    totalContributed += total;

    const topUp = applyVoluntaryTopUp(
      balances,
      params.voluntaryTopUp,
      month,
      isFirstMonth,
      age,
      bhs,
      currentFrs,
      currentErs,
      taxReliefUsed,
    );
    accumulator.voluntaryTopUp += topUp.amount;
    accumulator.topUpTaxReliefEligible += topUp.taxReliefEligible;
    taxReliefUsed += topUp.taxReliefEligible;

    const overflowAfterInflows = enforceBhs(
      balances,
      bhs,
      age,
      currentFrs,
      cohortFrs,
    );
    addBalances(accumulator.distribution, overflowAfterInflows);

    if (month === 12) {
      creditAnnualInterest(
        balances,
        accruedInterest,
        saClosed,
        cohortFrs,
      );
      accruedInterest = emptyInterest();
      enforceBhs(balances, bhs, age, currentFrs, cohortFrs);
    }

    if (isBirthdayMonth && age === 55) {
      milestones.age55 = balancesFromCents(balances);
    }
    if (isBirthdayMonth && age === 65) {
      milestones.age65 = balancesFromCents(balances);
    }
    if (isBirthdayMonth && age === 70) {
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
        ...(accumulator.topUpTaxReliefEligible > 0
          ? {
              topUpTaxReliefEligible: fromCents(
                accumulator.topUpTaxReliefEligible,
              ),
            }
          : {}),
        bhs: policy.bhs.value,
        retirementSums: policy.retirement.value,
        policy: lastPolicy.projection,
      });
      accumulator = emptyYearAccumulator();
    }
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
      interest: "cpf-floor-rates",
      futurePolicy: "freeze-last-published",
      retirementRouting: routing,
    },
    totalContributed: fromCents(totalContributed),
    totalInterestEarned: fromCents(totalInterestEarned),
  };
}
