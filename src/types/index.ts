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
  minAge: number;
  maxAge?: number;
  contributionRate: ContributionRate;
  distributionRate: DistributionRate;
}

// Type for CPF income ceiling based on string keys
export type CPFIncomeCeiling = Record<string, number>;

// Interface for income options based on age and ceiling usage
export interface IncomeOptions {
  age?: number;
  ageGroup?: AgeGroup;
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
  distribution: DistributionRate;
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

// Interface for monthly SGS yield data
export interface MonthlyYield {
  month: string;
  yield: number;
}

// Interface for interest rate trend data (computed)
export interface InterestRateTrendData {
  month: string;
  sgsYield: number;
  peggedRate: number;
  actualRate: number;
}

// Projection types

export type CitizenshipStatus =
  | "citizen"
  | "spr-year1"
  | "spr-year2"
  | "spr-year3-plus";

export interface VoluntaryTopUp {
  amount: number;
  account: "SA" | "MA" | "RA";
  frequency: "monthly" | "yearly";
}

export interface OaToSaTransfer {
  amount: number;
  timing: "now" | "yearly";
}

export interface ProjectionParams {
  monthlyIncome: number;
  birthDate: string;
  startAge?: number;
  endAge?: number;
  housingWithdrawal?: number;
  voluntaryTopUp?: VoluntaryTopUp;
  oaToSaTransfer?: OaToSaTransfer;
  citizenship: CitizenshipStatus;
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
  age: number;
  ageGroup: string;
  balances: AccountBalances;
  contributions: YearlyContribution;
  distribution: YearlyDistribution;
  interestEarned: YearlyInterest;
  housingWithdrawal?: number;
  voluntaryTopUp?: number;
}

export interface CpfLifeEstimate {
  standardMonthly: number;
  escalatingStartMonthly: number;
  basicMonthly: number;
  deferredTo70Monthly: number;
}

export interface ProjectionResult {
  input: ProjectionParams;
  yearlyBalances: YearlyBalance[];
  milestones: {
    age55: AccountBalances;
    age65: AccountBalances;
    age70?: AccountBalances;
  };
  cpfLifeEstimate: CpfLifeEstimate;
  totalContributed: number;
  totalInterestEarned: number;
}

export interface ScenarioDifference {
  totalContributions: number;
  totalInterestEarned: number;
  age65Balance: number;
  cpfLifeMonthlyPayout: number;
}

export interface ScenarioResult {
  baseline: ProjectionResult;
  scenario: ProjectionResult;
  difference: ScenarioDifference;
  insights: string[];
}
