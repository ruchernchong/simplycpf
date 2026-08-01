import { CPF_CONTRIBUTION_SCHEDULES, CPF_WAGE_RULES } from "./contributions";
import {
  CPF_INTEREST_RATE_METHODOLOGY,
  CPF_QUARTERLY_INTEREST_RATES,
} from "./interest";
import {
  CPF_BASIC_HEALTHCARE_SUM_ROWS,
  CPF_COHORT_FULL_RETIREMENT_SUM_ROWS,
  CPF_LIFE_POLICY,
  CPF_RETIREMENT_SUM_ROWS,
} from "./reference-data";
import { POLICY_METADATA, POLICY_SOURCES } from "./sources";

/**
 * Small statutory rules that used to be repeated in page copy and tools.
 * Values here are policy facts; product assumptions belong with the result
 * that uses them and must not be added to this object.
 */
export const CPF_POLICY_RULES = {
  wageBands: {
    ...CPF_WAGE_RULES,
    status: "official",
    verifiedAt: POLICY_METADATA["cpf-contribution-rates"].verifiedAt,
    sourceUrls: [
      POLICY_SOURCES.contributionCurrent.url,
      POLICY_SOURCES.contributionPast.url,
    ],
  },
  contributionRounding: {
    totalContributionUnit: "nearest whole dollar",
    totalContributionHalfUpAtCents: 50,
    employeeShare: "discard cents",
    employerShare: "rounded total less employee share",
    status: "official",
    verifiedAt: POLICY_METADATA["cpf-contribution-rates"].verifiedAt,
    sourceUrls: [
      POLICY_SOURCES.contributionRounding.url,
      POLICY_SOURCES.contributionCurrent.url,
      POLICY_SOURCES.contributionPast.url,
    ],
  },
  permanentResidentGraduatedRates: {
    effectiveFrom: "2016-01-01",
    year1Starts: "PR conversion date",
    laterYearsStart: "first day of the month after each anniversary",
    status: "official",
    verifiedAt: POLICY_METADATA["cpf-contribution-rates"].verifiedAt,
    sourceUrls: [POLICY_SOURCES.contributionPast.url],
  },
  interestTransactions: {
    computation: "monthly",
    crediting: "annually by the following year",
    freshInflowsStartEarning: "following month",
    withdrawalsStopEarning: "withdrawal month",
    existingCpfTransfersStartEarningInDestination: "transfer month",
    status: "official",
    verifiedAt: POLICY_METADATA["cpf-interest-rates"].verifiedAt,
    sourceUrls: [
      POLICY_SOURCES.interestCrediting.url,
      POLICY_SOURCES.interestTransferTiming.url,
      POLICY_SOURCES.specialAccountClosureInterest.url,
    ],
  },
  lifecycleAges: {
    retirementAccountCreated: 55,
    specialAccountClosed: 55,
    basicHealthcareSumFrozen: 65,
    cpfLifePayoutEligibility: 65,
    latestCpfLifePayoutStart: 70,
    latestVoluntaryCpfLifeJoinAgeExclusive: 80,
    status: "official",
    verifiedAt: POLICY_METADATA["cpf-special-account-closure"].verifiedAt,
    sourceUrls: [
      POLICY_SOURCES.retirementSums.url,
      POLICY_SOURCES.specialAccountClosure.url,
      POLICY_SOURCES.basicHealthcareSum.url,
      POLICY_SOURCES.cpfLife.url,
      POLICY_SOURCES.cpfLifeEligibility.url,
    ],
  },
  basicHealthcareSumOverflow: {
    firstDestinationBelow55: "SA",
    firstDestinationFrom55: "RA",
    destinationLimit: "FRS",
    destinationAfterFrs: "OA",
    appliesTo: "MediSave savings above the member's applicable BHS",
    cashTopUpAboveBhs: "rejected and refunded in full",
    status: "official",
    verifiedAt: POLICY_METADATA["cpf-basic-healthcare-sum"].verifiedAt,
    sourceUrls: [
      POLICY_SOURCES.basicHealthcareSumOverflow.url,
      POLICY_SOURCES.medisaveTopUpLimit.url,
    ],
  },
  specialAccountClosure: {
    effectiveDate: "2025-01-19",
    appliesFromAge: 55,
    routeToRetirementAccountUntil: "FRS",
    routeRemainderTo: "OA",
    transferredSavingsInterest:
      "destination account rate from the month of transfer",
    status: "official",
    verifiedAt: POLICY_METADATA["cpf-special-account-closure"].verifiedAt,
    sourceUrls: [
      POLICY_SOURCES.specialAccountClosure.url,
      POLICY_SOURCES.specialAccountClosureInterest.url,
    ],
  },
  retirementAccountAt55: {
    creationAge: 55,
    transferOrder: ["SA", "OA"],
    transferReferenceCap: "cohort FRS",
    status: "official",
    verifiedAt: POLICY_METADATA["cpf-special-account-closure"].verifiedAt,
    sourceUrls: [
      POLICY_SOURCES.retirementSums.url,
      POLICY_SOURCES.reachingAge55.url,
    ],
  },
  age55PropertyPledge: {
    qualifyingLeaseMustLastThroughAge: 95,
    maximumPropertyComponentOfFrs: 0.5,
    note: "A qualifying Singapore property can account for up to half the FRS; individual withdrawal eligibility still depends on CPF Board's rules and member circumstances.",
    status: "official",
    verifiedAt: POLICY_METADATA["cpf-special-account-closure"].verifiedAt,
    sourceUrls: [
      POLICY_SOURCES.retirementSums.url,
      POLICY_SOURCES.age55PropertyWithdrawal.url,
    ],
  },
  retirementWithdrawals: {
    effectiveFrom: "2026-01-01",
    cohortBornOnOrAfter: "1958-01-01",
    fromAge55: {
      unconditionalAmount: 5000,
      afterFullRetirementSum:
        "excess Ordinary Account savings are withdrawable",
      propertyOption: {
        minimumAge: 55,
        minimumRemainingLeaseThroughAge: 95,
        retirementAccountFloor: "BRS",
        restorationTargetOnSaleOrTransfer: "FRS",
        generallyExcludedFromWithdrawableRaSavings: [
          "interest earned",
          "government grants received",
          "retirement top-ups",
        ],
      },
    },
    fromAge65: {
      additionalRetirementSavingsPercentage: 20,
      lessAge55WithdrawableAmount: 5000,
      generallyExcludedFromCalculation: [
        "cash top-ups",
        "CPF transfers",
        "government grants",
      ],
    },
    note: "Withdrawal eligibility and amounts vary by birth cohort and individual account history. Members should confirm their withdrawable amount in CPF Board's Retirement Dashboard.",
    status: "official",
    verifiedAt: POLICY_METADATA["cpf-retirement-withdrawals"].verifiedAt,
    sourceUrls: [
      POLICY_SOURCES.retirementWithdrawals.url,
      POLICY_SOURCES.withdrawalCohorts.url,
      POLICY_SOURCES.age55PropertyWithdrawal.url,
      POLICY_SOURCES.age65Withdrawals.url,
    ],
  },
  housingRefunds: {
    requiredComponents: [
      "CPF principal withdrawn for the property",
      "accrued interest",
    ],
    pledgedAmountAlsoRefundedFromAge55: true,
    marketValueNetProceedsLimit: {
      maximumRefund: "selling price less outstanding housing loan",
      cashTopUpForShortfallRequired: false,
      condition: "property is sold at market value",
    },
    refundRouting: {
      below55: ["OA"],
      age55AndAbove: ["RA up to required retirement sum", "OA"],
    },
    status: "official",
    verifiedAt: POLICY_METADATA["cpf-housing-refunds"].verifiedAt,
    sourceUrls: [POLICY_SOURCES.housingRefunds.url],
  },
  retirementTopUps: {
    effectiveFrom: "2026-01-01",
    taxRelief: {
      selfAnnualCap: 8000,
      familyAnnualCap: 8000,
      combinedAnnualCap: 16000,
      spouseOrSiblingIncomeCondition: 8000,
      spouseOrSiblingIncomeThresholdFromYearOfAssessment: 2025,
      overallPersonalReliefCap: 80000,
      cashTopUpsOnly: true,
      cpfTransfersQualify: false,
      matchingGrantTopUpsQualify: false,
    },
    actualCapacity: {
      below55Account: "SA",
      below55Limit: "current FRS less qualifying retirement savings",
      from55Account: "RA",
      from55Limit: "current ERS less qualifying retirement savings",
    },
    recurringCpfTransferTiming:
      "after CPF contributions for the month have been credited",
    qualifyingCapacity: {
      below55:
        "current FRS less SA savings and net SA savings withdrawn for investments",
      age55AndAbove: "current ERS less RA savings",
    },
    matchedRetirementSavingsScheme: {
      annualMatchingGrantCap: 2000,
      lifetimeMatchingGrantCap: 20000,
      qualifyingTopUpsDoNotReceiveTaxRelief: true,
    },
    status: "official",
    verifiedAt: POLICY_METADATA["cpf-retirement-top-ups"].verifiedAt,
    sourceUrls: [
      POLICY_SOURCES.retirementTopUps.url,
      POLICY_SOURCES.matchedRetirementSavings.url,
      POLICY_SOURCES.medisaveTopUpLimit.url,
      POLICY_SOURCES.recurringTransferTiming.url,
      POLICY_SOURCES.irasCashTopUpRelief.url,
    ],
  },
  extraInterest: {
    effectiveFrom: "2016-01-01",
    combinedBalanceCap: 60000,
    ordinaryAccountCap: 20000,
    accountPriority: ["RA", "OA", "SA", "MA"],
    below55: {
      extraPercentagePoints: 1,
      balanceCap: 60000,
      oaExtraInterestCreditedTo: "SA",
    },
    age55AndAbove: {
      firstTier: { balanceCap: 30000, extraPercentagePoints: 2 },
      secondTier: { balanceCap: 30000, extraPercentagePoints: 1 },
      oaExtraInterestCreditedTo: "RA",
    },
    status: "official",
    verifiedAt: POLICY_METADATA["cpf-extra-interest"].verifiedAt,
    sourceUrls: [POLICY_SOURCES.extraInterest.url],
  },
  statutoryEmploymentAges: {
    effectiveDate: "2026-07-01",
    retirementAge: 64,
    reEmploymentAge: 69,
    cohorts: [
      {
        bornFrom: "1958-07-01",
        bornTo: "1960-06-30",
        retirementAge: 62,
        reEmploymentAge: 69,
      },
      {
        bornFrom: "1960-07-01",
        bornTo: "1963-06-30",
        retirementAge: 63,
        reEmploymentAge: 69,
      },
      {
        bornFrom: "1963-07-01",
        retirementAge: 64,
        reEmploymentAge: 69,
      },
    ],
    status: "official",
    verifiedAt: POLICY_METADATA["mom-retirement-re-employment-ages"].verifiedAt,
    sourceUrls: [POLICY_SOURCES.momRetirementAges.url],
  },
} as const;

/** Single import target for official policy data and provenance. */
export const CPF_POLICY_CATALOGUE = {
  version: "2.0.0",
  sources: POLICY_SOURCES,
  metadata: POLICY_METADATA,
  rules: CPF_POLICY_RULES,
  contributionSchedules: CPF_CONTRIBUTION_SCHEDULES,
  basicHealthcareSums: CPF_BASIC_HEALTHCARE_SUM_ROWS,
  cohortFullRetirementSums: CPF_COHORT_FULL_RETIREMENT_SUM_ROWS,
  retirementSums: CPF_RETIREMENT_SUM_ROWS,
  cpfLife: CPF_LIFE_POLICY,
  interestRateMethodology: CPF_INTEREST_RATE_METHODOLOGY,
  quarterlyInterestRates: CPF_QUARTERLY_INTEREST_RATES,
} as const;
