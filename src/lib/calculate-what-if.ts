import { calculateCpfProjection } from "@/lib/calculate-cpf-projection";
import { formatCurrency } from "@/lib/format";
import type {
  CitizenshipStatus,
  OaToSaTransfer,
  ProjectionParams,
  ProjectionResult,
  ScenarioDifference,
  ScenarioResult,
  VoluntaryTopUp,
} from "@/types";

export interface SalaryChangeScenarioParams {
  projection: ProjectionParams;
  newMonthlyIncome: number;
}

export interface OaToSaScenarioParams {
  projection: ProjectionParams;
  transferAmount: number;
  timing?: OaToSaTransfer["timing"];
}

export interface VoluntaryTopUpScenarioParams {
  projection: ProjectionParams;
  amount: number;
  account: VoluntaryTopUp["account"];
  frequency?: VoluntaryTopUp["frequency"];
}

export interface AgeComparisonScenarioParams {
  monthlyIncome: number;
  endAge: number;
  citizenship: CitizenshipStatus;
  baselineStartAge: number;
  scenarioStartAge: number;
}

function getTotalBalanceAtAge(result: ProjectionResult, age: number): number {
  const ageSnapshot = result.yearlyBalances.find((entry) => entry.age === age);
  const balances =
    ageSnapshot?.balances ?? result.yearlyBalances.at(-1)?.balances;

  if (!balances) {
    return 0;
  }

  return balances.oa + balances.sa + balances.ma + balances.ra;
}

function buildDifference(
  baseline: ProjectionResult,
  scenario: ProjectionResult,
): ScenarioDifference {
  return {
    totalContributions: scenario.totalContributed - baseline.totalContributed,
    totalInterestEarned:
      scenario.totalInterestEarned - baseline.totalInterestEarned,
    age65Balance:
      getTotalBalanceAtAge(scenario, 65) - getTotalBalanceAtAge(baseline, 65),
    cpfLifeMonthlyPayout:
      scenario.cpfLifeEstimate.standardMonthly -
      baseline.cpfLifeEstimate.standardMonthly,
  };
}

function formatSignedCurrency(value: number, decimalPlaces = 0): string {
  return formatCurrency(Math.abs(value), decimalPlaces).replace("$", "S$");
}

function buildSalaryChangeInsights(
  currentIncome: number,
  newMonthlyIncome: number,
  difference: ScenarioDifference,
): string[] {
  const incomeDelta = newMonthlyIncome - currentIncome;

  if (incomeDelta >= 0) {
    return [
      `A monthly income increase of ${formatSignedCurrency(incomeDelta, 0)} could leave you with about ${formatSignedCurrency(difference.age65Balance, 0)} more by age 65.`,
      `Your Standard CPF LIFE estimate could rise by about ${formatSignedCurrency(difference.cpfLifeMonthlyPayout, 0)} per month.`,
      `Across the full projection horizon, your total CPF contributions could increase by about ${formatSignedCurrency(difference.totalContributions, 0)}.`,
    ];
  }

  return [
    `A monthly income reduction of ${formatSignedCurrency(incomeDelta, 0)} could leave you with about ${formatSignedCurrency(difference.age65Balance, 0)} less by age 65.`,
    `Your Standard CPF LIFE estimate could fall by about ${formatSignedCurrency(difference.cpfLifeMonthlyPayout, 0)} per month.`,
    `The drop comes from both lower CPF contributions and fewer dollars compounding at CPF interest rates over time.`,
  ];
}

function buildTransferInsights(
  transferAmount: number,
  timing: OaToSaTransfer["timing"],
  difference: ScenarioDifference,
): string[] {
  return [
    `${timing === "yearly" ? "Moving" : "A one-off move of"} ${formatSignedCurrency(transferAmount, 0)} from OA to SA could generate about ${formatSignedCurrency(difference.totalInterestEarned, 0)} more interest across the projection horizon.`,
    `That transfer pattern could improve your projected CPF balance at age 65 by about ${formatSignedCurrency(difference.age65Balance, 0)}.`,
    `Your Standard CPF LIFE estimate could change by about ${formatSignedCurrency(difference.cpfLifeMonthlyPayout, 0)} per month.`,
  ];
}

function buildTopUpInsights(
  amount: number,
  account: VoluntaryTopUp["account"],
  difference: ScenarioDifference,
): string[] {
  return [
    `An annual ${formatSignedCurrency(amount, 0)} top-up to ${account} could add about ${formatSignedCurrency(difference.age65Balance, 0)} to your projected CPF balance at age 65.`,
    `You may also qualify for up to S$8,000 of personal tax relief each year, subject to the prevailing CPF top-up rules.`,
    `Your Standard CPF LIFE estimate could change by about ${formatSignedCurrency(difference.cpfLifeMonthlyPayout, 0)} per month.`,
  ];
}

function buildAgeComparisonInsights(
  baselineStartAge: number,
  scenarioStartAge: number,
  difference: ScenarioDifference,
): string[] {
  if (scenarioStartAge > baselineStartAge) {
    return [
      `Starting at age ${scenarioStartAge} instead of age ${baselineStartAge} could leave you with about ${formatSignedCurrency(difference.age65Balance, 0)} less by age 65.`,
      `The delay reduces both the years of CPF contributions and the time available for compounding.`,
      `Your Standard CPF LIFE estimate could be about ${formatSignedCurrency(difference.cpfLifeMonthlyPayout, 0)} per month lower.`,
    ];
  }

  return [
    `Starting at age ${scenarioStartAge} instead of age ${baselineStartAge} could leave you with about ${formatSignedCurrency(difference.age65Balance, 0)} more by age 65.`,
    `The earlier start gives your CPF balances more years to compound at CPF interest rates.`,
    `Your Standard CPF LIFE estimate could be about ${formatSignedCurrency(difference.cpfLifeMonthlyPayout, 0)} per month higher.`,
  ];
}

export function calculateSalaryChangeScenario({
  projection,
  newMonthlyIncome,
}: SalaryChangeScenarioParams): ScenarioResult {
  const baseline = calculateCpfProjection(projection);
  const scenario = calculateCpfProjection({
    ...projection,
    monthlyIncome: newMonthlyIncome,
  });
  const difference = buildDifference(baseline, scenario);

  return {
    baseline,
    scenario,
    difference,
    insights: buildSalaryChangeInsights(
      projection.monthlyIncome,
      newMonthlyIncome,
      difference,
    ),
  };
}

export function calculateOaToSaScenario({
  projection,
  transferAmount,
  timing = "now",
}: OaToSaScenarioParams): ScenarioResult {
  const baseline = calculateCpfProjection(projection);
  const scenario = calculateCpfProjection({
    ...projection,
    oaToSaTransfer: {
      amount: transferAmount,
      timing,
    },
  });
  const difference = buildDifference(baseline, scenario);

  return {
    baseline,
    scenario,
    difference,
    insights: buildTransferInsights(transferAmount, timing, difference),
  };
}

export function calculateVoluntaryTopUpScenario({
  projection,
  amount,
  account,
  frequency = "yearly",
}: VoluntaryTopUpScenarioParams): ScenarioResult {
  const baseline = calculateCpfProjection(projection);
  const scenario = calculateCpfProjection({
    ...projection,
    voluntaryTopUp: {
      amount,
      account,
      frequency,
    },
  });
  const difference = buildDifference(baseline, scenario);

  return {
    baseline,
    scenario,
    difference,
    insights: buildTopUpInsights(amount, account, difference),
  };
}

export function calculateAgeComparisonScenario({
  monthlyIncome,
  endAge,
  citizenship,
  baselineStartAge,
  scenarioStartAge,
}: AgeComparisonScenarioParams): ScenarioResult {
  const baseline = calculateCpfProjection({
    monthlyIncome,
    birthDate: "",
    startAge: baselineStartAge,
    endAge,
    citizenship,
  });
  const scenario = calculateCpfProjection({
    monthlyIncome,
    birthDate: "",
    startAge: scenarioStartAge,
    endAge,
    citizenship,
  });
  const difference = buildDifference(baseline, scenario);

  return {
    baseline,
    scenario,
    difference,
    insights: buildAgeComparisonInsights(
      baselineStartAge,
      scenarioStartAge,
      difference,
    ),
  };
}
