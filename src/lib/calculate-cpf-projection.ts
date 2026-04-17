import { CPF_INCOME_CEILING } from "@/constants";
import { getBhsForYear } from "@/constants/cpf-bhs";
import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";
import {
  CPF_EXTRA_INTEREST_CAP,
  CPF_EXTRA_INTEREST_RATE,
  CPF_OA_EXTRA_INTEREST_CAP,
} from "@/constants/cpf-interest-tiers";
import { getRetirementSumsForYear } from "@/constants/cpf-retirement-sums";
import { ageGroups } from "@/data";
import { prYear1Rates, prYear2Rates } from "@/data/pr-rates";
import { findAgeGroup } from "@/lib/find-age-group";
import type {
  AccountBalances,
  CitizenshipStatus,
  CpfLifeEstimate,
  OaToSaTransfer,
  ProjectionParams,
  ProjectionResult,
  VoluntaryTopUp,
  YearlyBalance,
} from "@/types";

const CPF_LIFE_PAYOUT_FACTOR = 0.0073;
const CPF_LIFE_ESCALATING_START_RATIO = 0.8;
const CPF_LIFE_BASIC_RATIO = 0.9;
const CPF_LIFE_DEFER_ANNUAL_INCREASE = 0.07;
const CPF_LIFE_MAX_DEFER_YEARS = 5;
const CPF_LIFE_MIN_RETIREMENT_SAVINGS = 60_000;
const TAX_RELIEF_SELF = 8_000;

function getAgeGroupsForCitizenship(citizenship: CitizenshipStatus) {
  switch (citizenship) {
    case "spr-year1":
      return prYear1Rates;
    case "spr-year2":
      return prYear2Rates;
    default:
      return ageGroups;
  }
}

function calculateExtraInterest(balances: AccountBalances, age: number) {
  const oaPortion = Math.min(balances.oa, CPF_OA_EXTRA_INTEREST_CAP);
  const remainingCap = CPF_EXTRA_INTEREST_CAP - oaPortion;
  const smraPortion = Math.min(
    balances.sa + balances.ma + balances.ra,
    remainingCap,
  );

  const oaExtra = oaPortion * CPF_EXTRA_INTEREST_RATE;
  const smraExtra = smraPortion * CPF_EXTRA_INTEREST_RATE;

  if (age >= 55) {
    return { oaExtra: 0, smraExtra: oaExtra + smraExtra };
  }

  return { oaExtra, smraExtra };
}

function applyBhsCap(
  balances: AccountBalances,
  year: number,
  frs: number,
  saClosed: boolean,
) {
  const bhs = getBhsForYear(year);
  const maOverflow = Math.max(0, balances.ma - bhs);

  if (maOverflow <= 0) return balances;

  const newMa = bhs;

  if (!saClosed && balances.sa < frs) {
    const saSpace = frs - balances.sa;
    const toSa = Math.min(maOverflow, saSpace);
    const toOa = maOverflow - toSa;
    return {
      oa: balances.oa + toOa,
      sa: balances.sa + toSa,
      ma: newMa,
      ra: balances.ra,
    };
  }

  return {
    oa: balances.oa + maOverflow,
    sa: balances.sa,
    ma: newMa,
    ra: balances.ra,
  };
}

function applyVoluntaryTopUp(
  balances: AccountBalances,
  topUp: VoluntaryTopUp | undefined,
  frs: number,
  ers: number,
  age: number,
): { balances: AccountBalances; topUpAmount: number } {
  if (!topUp || topUp.amount <= 0) {
    return { balances, topUpAmount: 0 };
  }

  const amount = Math.min(
    topUp.amount,
    age < 55 ? TAX_RELIEF_SELF : TAX_RELIEF_SELF,
  );

  if (age < 55) {
    const maxTopUp = Math.max(0, frs - balances.sa);
    const actualTopUp = Math.min(amount, maxTopUp);
    if (topUp.account === "SA") {
      return {
        balances: { ...balances, sa: balances.sa + actualTopUp },
        topUpAmount: actualTopUp,
      };
    }
    if (topUp.account === "MA") {
      return {
        balances: { ...balances, ma: balances.ma + amount },
        topUpAmount: amount,
      };
    }
  } else {
    const maxTopUp = Math.max(0, ers - balances.ra);
    const actualTopUp = Math.min(amount, maxTopUp);
    if (topUp.account === "RA" || topUp.account === "SA") {
      return {
        balances: { ...balances, ra: balances.ra + actualTopUp },
        topUpAmount: actualTopUp,
      };
    }
    if (topUp.account === "MA") {
      return {
        balances: { ...balances, ma: balances.ma + amount },
        topUpAmount: amount,
      };
    }
  }

  return { balances, topUpAmount: 0 };
}

function applyOaToSaTransfer(
  balances: AccountBalances,
  transfer: OaToSaTransfer | undefined,
  frs: number,
  age: number,
): AccountBalances {
  if (!transfer || transfer.amount <= 0) return balances;

  if (age < 55) {
    const maxTransfer = Math.max(0, frs - balances.sa);
    const actualTransfer = Math.min(transfer.amount, balances.oa, maxTransfer);
    return {
      oa: balances.oa - actualTransfer,
      sa: balances.sa + actualTransfer,
      ma: balances.ma,
      ra: balances.ra,
    };
  }

  return balances;
}

function performSaToRaConversion(
  balances: AccountBalances,
  frs: number,
): AccountBalances {
  const raFromSa = Math.min(balances.sa, frs);
  const remainingFrs = frs - raFromSa;
  const raFromOa = Math.min(balances.oa, remainingFrs);

  return {
    oa: balances.oa - raFromOa,
    sa: 0,
    ma: balances.ma,
    ra: balances.ra + raFromSa + raFromOa,
  };
}

function estimateCpfLife(raBalance: number): CpfLifeEstimate {
  if (raBalance < CPF_LIFE_MIN_RETIREMENT_SAVINGS) {
    return {
      standardMonthly: 0,
      escalatingStartMonthly: 0,
      basicMonthly: 0,
      deferredTo70Monthly: 0,
    };
  }

  const standardMonthly = Math.round(raBalance * CPF_LIFE_PAYOUT_FACTOR);
  const escalatingStartMonthly = Math.round(
    standardMonthly * CPF_LIFE_ESCALATING_START_RATIO,
  );
  const basicMonthly = Math.round(standardMonthly * CPF_LIFE_BASIC_RATIO);
  const deferredTo70Monthly = Math.round(
    standardMonthly *
      (1 + CPF_LIFE_DEFER_ANNUAL_INCREASE * CPF_LIFE_MAX_DEFER_YEARS),
  );

  return {
    standardMonthly,
    escalatingStartMonthly,
    basicMonthly,
    deferredTo70Monthly,
  };
}

export function calculateCpfProjection(
  params: ProjectionParams,
): ProjectionResult {
  const {
    monthlyIncome,
    birthDate,
    startAge: overrideStartAge,
    endAge: overrideEndAge = 65,
    housingWithdrawal = 0,
    voluntaryTopUp,
    oaToSaTransfer,
    citizenship,
  } = params;

  const currentYear = new Date().getFullYear();
  const currentAge = overrideStartAge ?? calculateAgeFromBirthDate(birthDate);
  const projectionYears = overrideEndAge - currentAge;
  const applicableAgeGroups = getAgeGroupsForCitizenship(citizenship);

  let balances: AccountBalances = { oa: 0, sa: 0, ma: 0, ra: 0 };
  const yearlyBalances: YearlyBalance[] = [];
  const milestones: ProjectionResult["milestones"] = {
    age55: { oa: 0, sa: 0, ma: 0, ra: 0 },
    age65: { oa: 0, sa: 0, ma: 0, ra: 0 },
  };

  let totalContributed = 0;
  let totalInterestEarned = 0;
  let saClosed = false;

  for (let i = 0; i <= projectionYears; i++) {
    const projectedAge = currentAge + i;
    const projectedYear = currentYear + i;
    const ageGroup = findAgeGroup(projectedAge, applicableAgeGroups);

    const incomeCeiling = CPF_INCOME_CEILING[projectedYear.toString()] ?? 8000;
    const cappedIncome = Math.min(monthlyIncome, incomeCeiling);

    const employeeRate = ageGroup.contributionRate.employee;
    const employerRate = ageGroup.contributionRate.employer;

    const monthlyEmployeeContribution = employeeRate * cappedIncome;
    const monthlyEmployerContribution = employerRate * cappedIncome;
    const monthlyTotal =
      monthlyEmployeeContribution + monthlyEmployerContribution;

    const yearlyEmployee =
      Math.round(monthlyEmployeeContribution * 12 * 100) / 100;
    const yearlyEmployer =
      Math.round(monthlyEmployerContribution * 12 * 100) / 100;
    const yearlyTotal = Math.round(monthlyTotal * 12 * 100) / 100;

    totalContributed += yearlyTotal;

    const { frs, ers } = getRetirementSumsForYear(projectedYear);

    const yearlyOaDist =
      Math.round(
        monthlyTotal * (ageGroup.distributionRate.OA ?? 0) * 12 * 100,
      ) / 100;
    const yearlySaDist =
      Math.round(
        monthlyTotal * (ageGroup.distributionRate.SA ?? 0) * 12 * 100,
      ) / 100;
    const yearlyMaDist =
      Math.round(
        monthlyTotal * (ageGroup.distributionRate.MA ?? 0) * 12 * 100,
      ) / 100;
    const yearlyRaDist =
      Math.round(
        monthlyTotal * (ageGroup.distributionRate.RA ?? 0) * 12 * 100,
      ) / 100;

    balances.oa += yearlyOaDist;
    if (!saClosed) balances.sa += yearlySaDist;
    balances.ma += yearlyMaDist;
    if (saClosed) balances.ra += yearlyRaDist;

    balances = applyBhsCap(balances, projectedYear, frs, saClosed);

    balances.oa -= housingWithdrawal * 12;
    balances.oa = Math.max(0, balances.oa);

    const topUpResult = applyVoluntaryTopUp(
      balances,
      voluntaryTopUp?.frequency === "yearly" ||
        (i === 0 && voluntaryTopUp?.frequency === "monthly")
        ? voluntaryTopUp
        : undefined,
      frs,
      ers,
      projectedAge,
    );
    balances = topUpResult.balances;

    const transferResult = applyOaToSaTransfer(
      balances,
      oaToSaTransfer?.timing === "yearly" || (i === 0 && oaToSaTransfer)
        ? oaToSaTransfer
        : undefined,
      frs,
      projectedAge,
    );
    balances = transferResult;

    if (projectedAge === 55 && !saClosed) {
      balances = performSaToRaConversion(balances, frs);
      saClosed = true;
    }

    const extraInterest = calculateExtraInterest(balances, projectedAge);

    const oaInterest = balances.oa * (CPF_INTEREST_FLOOR_RATES.OA / 100);
    const saInterest = balances.sa * (CPF_INTEREST_FLOOR_RATES.SMRA / 100);
    const maInterest = balances.ma * (CPF_INTEREST_FLOOR_RATES.SMRA / 100);
    const raInterest = balances.ra * (CPF_INTEREST_FLOOR_RATES.SMRA / 100);

    balances.oa += oaInterest;
    if (!saClosed) balances.sa += saInterest + extraInterest.oaExtra;
    balances.ma += maInterest;
    balances.ra += raInterest + extraInterest.smraExtra;

    if (saClosed) {
      balances.ra += extraInterest.oaExtra;
    }

    balances = applyBhsCap(balances, projectedYear, frs, saClosed);

    const totalExtraInterest = extraInterest.oaExtra + extraInterest.smraExtra;
    const yearInterest =
      oaInterest + saInterest + maInterest + raInterest + totalExtraInterest;
    totalInterestEarned += yearInterest;

    yearlyBalances.push({
      year: projectedYear,
      age: projectedAge,
      ageGroup: ageGroup.description,
      balances: { ...balances },
      contributions: {
        employee: yearlyEmployee,
        employer: yearlyEmployer,
        total: yearlyTotal,
      },
      distribution: {
        oa: yearlyOaDist,
        sa: yearlySaDist,
        ma: yearlyMaDist,
        ra: yearlyRaDist,
      },
      interestEarned: {
        oa: Math.round(oaInterest * 100) / 100,
        sa: Math.round(saInterest * 100) / 100,
        ma: Math.round(maInterest * 100) / 100,
        ra: Math.round(raInterest * 100) / 100,
        extraInterest: Math.round(totalExtraInterest * 100) / 100,
      },
      housingWithdrawal:
        housingWithdrawal > 0 ? housingWithdrawal * 12 : undefined,
      voluntaryTopUp:
        topUpResult.topUpAmount > 0 ? topUpResult.topUpAmount : undefined,
    });

    if (projectedAge === 55) {
      milestones.age55 = { ...balances };
    }
    if (projectedAge === 65) {
      milestones.age65 = { ...balances };
    }
    if (projectedAge === 70) {
      milestones.age70 = { ...balances };
    }
  }

  const cpfLifeEstimate = estimateCpfLife(balances.ra);

  return {
    input: params,
    yearlyBalances,
    milestones,
    cpfLifeEstimate,
    totalContributed: Math.round(totalContributed * 100) / 100,
    totalInterestEarned: Math.round(totalInterestEarned * 100) / 100,
  };
}

function calculateAgeFromBirthDate(birthDate: string): number {
  if (!birthDate) return 0;
  const [month, year] = birthDate.split("/").map(Number);
  if (!month || !year) return 0;

  const now = new Date();
  const birthDateObj = new Date(year, month - 1);
  let age = now.getFullYear() - birthDateObj.getFullYear();
  if (now.getMonth() < birthDateObj.getMonth()) {
    age--;
  }
  return Math.max(0, age);
}
