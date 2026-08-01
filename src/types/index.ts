import type {
  AdditionalWageCeilingContext,
  ContributionCitizenship,
  ContributionDistribution,
  PolicyMetadata,
  PolicyStatus,
} from "@/policy";

export type { PolicyMetadata, PolicyStatus } from "@/policy";

// Interface for contribution rates by employee and employer
export interface ContributionRate {
  employee: number;
  employer: number;
}

// Type for distribution rates based on string keys
export type DistributionRate = Record<string, number>;

// Interface for defining age groups and associated rates
export interface AgeGroup {
  description: string;
  /** Lower boundary, excluded from this age band. Omitted for the first band. */
  minAgeExclusive?: number;
  /** Upper boundary, included in this age band. Omitted for the final band. */
  maxAgeInclusive?: number;
  contributionRate: ContributionRate;
  distributionRate: DistributionRate;
}

// Type for CPF income ceiling based on string keys
export type CPFIncomeCeiling = Record<string, number>;

// Interface for income options based on age and ceiling usage
export interface IncomeOptions {
  age?: number;
  ageGroup?: AgeGroup;
  citizenship?: ContributionCitizenship;
  useCeilingBeforeSep2023?: boolean;
}

// Interface for contribution result detail
export interface ContributionResult {
  totalContribution: number;
  employer: number;
  employee: number;
}

// Interface for individual distribution result
export interface DistributionResult {
  name: string;
  value: number;
}

// Interface for the computed result summary
export interface ComputedResult {
  contribution: ContributionResult;
  distribution: ContributionDistribution;
  afterCpfContribution: number;
}

// Interface for ceiling comparison result
export interface CeilingComparisonResult {
  preSept2023Result: ComputedResult;
  takeHomePayDifference: number; // positive = old ceiling gave more take-home
  totalContributionDifference: number; // negative = new ceiling contributes more CPF
}

// Interface for FAQ structure
export interface FAQ {
  question: string;
  answer: string;
}

// Interface for user settings
export interface Settings {
  shouldStoreInput: boolean;
  monthlyGrossIncome: number;
  birthDate: string;
  citizenshipStatus: CitizenshipStatus;
}

// Interface for quarterly CPF interest rates
export interface QuarterlyRate {
  quarter: string;
  oa: number;
  sa: number;
  ma: number;
  ra: number;
}

// Projection types

export type CitizenshipStatus =
  | "citizen"
  | "spr-year1"
  | "spr-year2"
  | "spr-year3-plus";

export interface VoluntaryTopUp {
  amount: number;
  account: "retirement" | "MA" | "SA" | "RA";
  frequency: "monthly" | "yearly";
}

export interface OaToSaTransfer {
  amount: number;
  timing: "now" | "yearly";
}

/**
 * An irreversible OA transfer to the member's age-appropriate retirement
 * account. `OaToSaTransfer` remains accepted for one compatibility cycle.
 */
export interface RetirementTransfer {
  amount: number;
  timing: "now" | "monthly" | "yearly";
}

/**
 * Annual AW-ceiling context for one explicitly scheduled payment.
 *
 * Callers may either provide the same annual OW/prior-AW inputs accepted by a
 * one-month contribution calculation, or provide the remaining AW ceiling
 * directly when that amount is already known from payroll records.
 */
export type ProjectionAdditionalWageCeilingContext =
  | AdditionalWageCeilingContext
  | {
      remainingAdditionalWageCeiling: number;
      annualOrdinaryWagesSubjectToCpf?: never;
      priorAdditionalWagesSubjectToCpf?: never;
    };

/** A one-off Additional Wage payment in an exact contribution month. */
export interface ProjectionAdditionalWage {
  contributionMonth: string;
  amount: number;
  additionalWageCeilingContext: ProjectionAdditionalWageCeilingContext;
}

export type RetirementRouting =
  | "full-retirement-sum"
  | "basic-retirement-sum-with-property";

export interface ProjectionParams {
  monthlyIncome: number;
  /**
   * Explicit one-off AW payments. No bonus amount or payment month is inferred.
   * At most one entry may be supplied for a contribution month.
   */
  additionalWages?: ProjectionAdditionalWage[];
  birthDate: string;
  /** Contribution month in YYYY-MM format. Defaults to the current month. */
  startMonth?: string;
  /** Required by the UI. Omitted legacy requests start from zero with a warning. */
  initialBalances?: AccountBalances;
  /**
   * Interest earned from January through the month before `startMonth` but not
   * yet credited. Supply destination-account totals from CPF records when a
   * projection starts after January.
   */
  initialYearToDateAccruedInterest?: AccountBalances;
  /** @deprecated Use birthDate; when both are present, birthDate wins. */
  startAge?: number;
  endAge?: number;
  /** SimplyCPF scenario: amount withdrawn from OA in every projection month. */
  housingWithdrawal?: number;
  /** Net SA savings withdrawn for CPFIS, counted towards the pre-RA FRS limit. */
  netSaSavingsWithdrawnForInvestments?: number;
  /**
   * CPF Board's RA-savings measure for retirement-sum and top-up limits. It
   * excludes interest and generally government grants, while including counted
   * retirement withdrawals and CPF LIFE premiums.
   */
  initialRaSavingsForLimits?: number;
  /**
   * RA principal treated as set aside for routing the post-55 retirement share
   * of employment contributions. Unlike `initialRaSavingsForLimits`, a
   * property-backed retirement withdrawal reduces this cash measure.
   */
  initialRaSavingsForContributionRouting?: number;
  /**
   * Cash top-up tax-relief cap already used in the start calendar year,
   * including qualifying retirement and MediSave top-ups. This does not
   * determine MRSS/MMSS or personal-income-tax eligibility.
   */
  initialCashTopUpTaxReliefUsedThisYear?: number;
  voluntaryTopUp?: VoluntaryTopUp;
  retirementTransfer?: RetirementTransfer;
  /** @deprecated Use `retirementTransfer`. */
  oaToSaTransfer?: OaToSaTransfer;
  retirementRouting?: RetirementRouting;
  citizenship: CitizenshipStatus;
  /** SPR conversion month in YYYY-MM; required by the UI for anniversary transitions. */
  permanentResidentSince?: string;
}

export interface AccountBalances {
  oa: number;
  sa: number;
  ma: number;
  ra: number;
}

export interface YearlyContribution {
  employee: number;
  employer: number;
  total: number;
}

export interface YearlyDistribution {
  oa: number;
  sa: number;
  ma: number;
  ra: number;
}

export interface YearlyInterest {
  oa: number;
  sa: number;
  ma: number;
  ra: number;
  extraInterest: number;
}

export interface YearlyBalance {
  year: number;
  /** Last contribution month included in this row, in YYYY-MM format. */
  month: string;
  age: number;
  ageGroup: string;
  balances: AccountBalances;
  contributions: YearlyContribution;
  distribution: YearlyDistribution;
  interestEarned: YearlyInterest;
  /** Interest accrued but not yet credited at the end of a partial year. */
  uncreditedInterest?: AccountBalances;
  housingWithdrawal?: number;
  voluntaryTopUp?: number;
  retirementTransfer?: number;
  propertyPledgeWithdrawal?: number;
  /** Requested top-up not applied because an official account limit was reached. */
  unappliedVoluntaryTopUp?: number;
  /**
   * Maximum potential cash top-up relief before MRSS/MMSS, giver/recipient,
   * residency and overall personal-relief-cap eligibility checks.
   */
  topUpPotentialTaxRelief?: number;
  /** RA savings counted towards retirement-sum and top-up limits. */
  raSavingsForLimits: number;
  /** RA principal used to decide whether employment contributions route to RA or OA. */
  raSavingsForContributionRouting: number;
  bhs: number;
  retirementSums: {
    brs: number;
    frs: number;
    ers: number;
  };
  policy: ProjectionPolicyMetadata;
}

export interface CpfLifeReferenceRow {
  raAt55: number;
  raAt65: number;
  monthlyPayoutAt65: number;
  monthlyPayoutAt70: number;
  label?: string;
}

export interface CpfLifeReference {
  referenceYear: number;
  plan: "Standard";
  profile: "male";
  rows: CpfLifeReferenceRow[];
  policy: PolicyMetadata;
  sourceUrl: string;
  personalisedEstimatorUrl: string;
  verifiedAt: string;
  note: string;
}

export interface ProjectionPolicyMetadata {
  status: PolicyStatus;
  contribution: PolicyMetadata;
  allocation: PolicyMetadata;
  wageCeiling: PolicyMetadata;
  bhs: PolicyMetadata;
  retirementSums: PolicyMetadata;
  cohortRetirementSum: PolicyMetadata;
  interest: PolicyMetadata;
  extraInterest: PolicyMetadata;
  specialAccountClosure: PolicyMetadata;
  retirementTopUps: PolicyMetadata;
  taxRelief: PolicyMetadata;
}

export interface ProjectionWarning {
  code:
    | "additional-wages-capped"
    | "initial-balances-defaulted"
    | "year-to-date-interest-defaulted"
    | "start-month-defaulted"
    | "legacy-projection-input"
    | "legacy-transfer-field"
    | "legacy-top-up-account"
    | "ma-tax-relief-not-estimated"
    | "medisave-top-up-rejected"
    | "retirement-top-up-capped"
    | "tax-relief-year-to-date-defaulted"
    | "tax-relief-eligibility-context-missing"
    | "retirement-top-up-capacity-context-missing"
    | "retirement-account-context-defaulted"
    | "property-withdrawal-context-simplified"
    | "pr-anniversary-not-modelled"
    | "pr-year-resolved-from-date"
    | "future-policy-frozen"
    | "retirement-routing-assumed"
    | "cpf-life-estimate-removed";
  message: string;
}

export interface ProjectionAssumptions {
  salary: "fixed-monthly-ordinary-wages";
  additionalWages: "explicit-dated-payments-only";
  interest: "official-quarterly-then-floor-assumption";
  futurePolicy: "freeze-last-published";
  startingBalances: "opening-of-start-month";
  initialYearToDateInterest: "provided-or-zero-with-warning";
  topUpTiming: "after-monthly-employment-contribution";
  cpfLife: "premiums-and-payouts-not-modelled";
  retirementRouting: RetirementRouting;
}

export interface ProjectionResult {
  input: ProjectionParams;
  yearlyBalances: YearlyBalance[];
  milestones: {
    age55?: AccountBalances;
    age65?: AccountBalances;
    age70?: AccountBalances;
  };
  cpfLifeReference: CpfLifeReference;
  /** @deprecated Personalised payout estimates belong to CPF Board. */
  cpfLifeEstimate: null;
  warnings: ProjectionWarning[];
  assumptions: ProjectionAssumptions;
  totalContributed: number;
  totalInterestEarned: number;
}

export interface ScenarioDifference {
  totalContributions: number;
  totalInterestEarned: number;
  age65Balance: number;
}

export interface ScenarioResult {
  baseline: ProjectionResult;
  scenario: ProjectionResult;
  difference: ScenarioDifference;
  insights: string[];
}
