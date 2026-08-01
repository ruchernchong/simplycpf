import { type NextRequest, NextResponse } from "next/server";
import {
  calculateCpfProjection,
  getCurrentSingaporeMonth,
} from "@/lib/calculate-cpf-projection";
import { ContributionPolicyError } from "@/policy";
import type {
  AccountBalances,
  CitizenshipStatus,
  OaToSaTransfer,
  ProjectionAdditionalWage,
  ProjectionParams,
  ProjectionWarning,
  RetirementRouting,
  RetirementTransfer,
  VoluntaryTopUp,
} from "@/types";

const MAX_YEARS = 50;

class ProjectionRequestError extends Error {}

interface NormalisedProjectionRequest {
  params: ProjectionParams;
  legacyInput?: Record<string, unknown>;
  warnings: ProjectionWarning[];
}

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  try {
    const normalised = normaliseProjectionRequest(body);
    const result = calculateCpfProjection(normalised.params);
    const response = {
      ...result,
      warnings: [...result.warnings, ...normalised.warnings],
      ...(normalised.legacyInput
        ? {
            deprecatedInput: normalised.legacyInput,
            projections: buildLegacyProjections(result),
          }
        : {}),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof ContributionPolicyError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === "UNSUPPORTED_POLICY_MONTH" ? 404 : 422 },
      );
    }
    if (
      error instanceof ProjectionRequestError ||
      error instanceof RangeError
    ) {
      return NextResponse.json(
        { error: error.message, code: "INVALID_INPUT" },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { error: "Unable to calculate the CPF projection." },
      { status: 500 },
    );
  }
};

function normaliseProjectionRequest(
  value: unknown,
): NormalisedProjectionRequest {
  if (!isRecord(value)) {
    throw invalid("Request body must be a JSON object.");
  }

  const usesLegacyEnvelope =
    value.income !== undefined ||
    value.age !== undefined ||
    value.years !== undefined;
  return usesLegacyEnvelope
    ? normaliseLegacyRequest(value)
    : normaliseModernRequest(value);
}

function normaliseLegacyRequest(
  value: Record<string, unknown>,
): NormalisedProjectionRequest {
  const income = requiredNonNegativeNumber(value.income, "income");
  const age = requiredWholeNumber(value.age, "age", 0);
  const years = requiredWholeNumber(value.years, "years", 1);
  if (years > MAX_YEARS) {
    throw invalid(`Maximum ${MAX_YEARS} years allowed.`);
  }

  const startMonth = optionalString(value.startMonth, "startMonth");
  const effectiveStartMonth = startMonth ?? getCurrentSingaporeMonth();
  const birthDate =
    optionalString(value.birthDate, "birthDate") ??
    birthDateForCompletedAge(age, effectiveStartMonth);
  const citizenship = parseCitizenship(value.citizenship, true);
  const enhancements = parseEnhancements(value);
  const params: ProjectionParams = {
    monthlyIncome: income,
    birthDate,
    ...(startMonth ? { startMonth } : {}),
    startAge: age,
    endAge: age + years - 1,
    citizenship,
    ...enhancements,
  };

  return {
    params,
    legacyInput: { income, age, years },
    warnings: [
      {
        code: "legacy-projection-input",
        message:
          "income, age and years are deprecated projection fields. Migrate to monthlyIncome, birthDate, startMonth, initialBalances and endAge.",
      },
    ],
  };
}

function normaliseModernRequest(
  value: Record<string, unknown>,
): NormalisedProjectionRequest {
  const monthlyIncome = requiredNonNegativeNumber(
    value.monthlyIncome,
    "monthlyIncome",
  );
  const startMonth = optionalString(value.startMonth, "startMonth");
  const hasInitialBalances = value.initialBalances !== undefined;
  if ((startMonth === undefined) !== !hasInitialBalances) {
    throw invalid(
      "startMonth and initialBalances must be supplied together for the v2 request.",
    );
  }

  const initialBalances = hasInitialBalances
    ? parseBalances(value.initialBalances)
    : undefined;
  const startAge = optionalWholeNumber(value.startAge, "startAge", 0);
  const birthDateValue = optionalString(value.birthDate, "birthDate");
  if (!birthDateValue && startAge === undefined) {
    throw invalid("birthDate is required for v2 requests.");
  }
  const effectiveStartMonth = startMonth ?? getCurrentSingaporeMonth();
  const birthDate =
    birthDateValue ??
    birthDateForCompletedAge(startAge ?? 0, effectiveStartMonth);
  const endAge = optionalWholeNumber(value.endAge, "endAge", 0);
  const compatibilityStartAge = birthDateValue ? undefined : startAge;
  if (
    compatibilityStartAge !== undefined &&
    endAge !== undefined &&
    endAge < compatibilityStartAge
  ) {
    throw invalid("endAge must be greater than or equal to startAge.");
  }
  if (
    compatibilityStartAge !== undefined &&
    endAge !== undefined &&
    endAge - compatibilityStartAge + 1 > MAX_YEARS
  ) {
    throw invalid(`Maximum ${MAX_YEARS} years allowed.`);
  }

  const citizenship = parseCitizenship(value.citizenship, false);
  const enhancements = parseEnhancements(value);
  const usesCompatibilityDefaults =
    startMonth === undefined && initialBalances === undefined;
  const warnings: ProjectionWarning[] = [];
  if (usesCompatibilityDefaults || !birthDateValue) {
    warnings.push({
      code: "legacy-projection-input",
      message:
        "This compatibility request omitted v2 starting context. Add birthDate, startMonth and initialBalances; zero balances or an inferred birth month are not complete personal data.",
    });
  }
  if (birthDateValue && startAge !== undefined) {
    warnings.push({
      code: "legacy-projection-input",
      message:
        "startAge is deprecated and was ignored because birthDate is the canonical age input.",
    });
  }

  return {
    params: {
      monthlyIncome,
      birthDate,
      ...(startMonth ? { startMonth } : {}),
      ...(initialBalances ? { initialBalances } : {}),
      ...(compatibilityStartAge === undefined
        ? {}
        : { startAge: compatibilityStartAge }),
      ...(endAge === undefined ? {} : { endAge }),
      citizenship,
      ...enhancements,
    },
    warnings,
  };
}

function parseEnhancements(
  value: Record<string, unknown>,
): Pick<
  ProjectionParams,
  | "housingWithdrawal"
  | "voluntaryTopUp"
  | "retirementTransfer"
  | "oaToSaTransfer"
  | "retirementRouting"
  | "permanentResidentSince"
  | "netSaSavingsWithdrawnForInvestments"
  | "initialYearToDateAccruedInterest"
  | "initialRaSavingsForLimits"
  | "initialRaSavingsForContributionRouting"
  | "initialCashTopUpTaxReliefUsedThisYear"
  | "additionalWages"
> {
  const housingWithdrawal = optionalNonNegativeNumber(
    value.housingWithdrawal,
    "housingWithdrawal",
  );
  const voluntaryTopUp = parseVoluntaryTopUp(value.voluntaryTopUp);
  const retirementTransfer = parseRetirementTransfer(value.retirementTransfer);
  const oaToSaTransfer = parseLegacyTransfer(value.oaToSaTransfer);
  if (retirementTransfer && oaToSaTransfer) {
    throw invalid(
      "Supply retirementTransfer or the deprecated oaToSaTransfer, not both.",
    );
  }
  const retirementRouting = parseRetirementRouting(value.retirementRouting);
  const permanentResidentSince = optionalString(
    value.permanentResidentSince,
    "permanentResidentSince",
  );
  const netSaSavingsWithdrawnForInvestments = optionalNonNegativeNumber(
    value.netSaSavingsWithdrawnForInvestments,
    "netSaSavingsWithdrawnForInvestments",
  );
  const initialYearToDateAccruedInterest =
    value.initialYearToDateAccruedInterest === undefined
      ? undefined
      : parseBalances(
          value.initialYearToDateAccruedInterest,
          "initialYearToDateAccruedInterest",
        );
  const initialRaSavingsForLimits = optionalNonNegativeNumber(
    value.initialRaSavingsForLimits,
    "initialRaSavingsForLimits",
  );
  const initialRaSavingsForContributionRouting = optionalNonNegativeNumber(
    value.initialRaSavingsForContributionRouting,
    "initialRaSavingsForContributionRouting",
  );
  const initialCashTopUpTaxReliefUsedThisYear = optionalNonNegativeNumber(
    value.initialCashTopUpTaxReliefUsedThisYear,
    "initialCashTopUpTaxReliefUsedThisYear",
  );
  const additionalWages = parseAdditionalWages(value.additionalWages);

  return {
    ...(housingWithdrawal === undefined ? {} : { housingWithdrawal }),
    ...(voluntaryTopUp ? { voluntaryTopUp } : {}),
    ...(retirementTransfer ? { retirementTransfer } : {}),
    ...(oaToSaTransfer ? { oaToSaTransfer } : {}),
    ...(retirementRouting ? { retirementRouting } : {}),
    ...(permanentResidentSince ? { permanentResidentSince } : {}),
    ...(netSaSavingsWithdrawnForInvestments === undefined
      ? {}
      : { netSaSavingsWithdrawnForInvestments }),
    ...(initialYearToDateAccruedInterest
      ? { initialYearToDateAccruedInterest }
      : {}),
    ...(initialRaSavingsForLimits === undefined
      ? {}
      : { initialRaSavingsForLimits }),
    ...(initialRaSavingsForContributionRouting === undefined
      ? {}
      : { initialRaSavingsForContributionRouting }),
    ...(initialCashTopUpTaxReliefUsedThisYear === undefined
      ? {}
      : { initialCashTopUpTaxReliefUsedThisYear }),
    ...(additionalWages ? { additionalWages } : {}),
  };
}

function parseAdditionalWages(
  value: unknown,
): ProjectionAdditionalWage[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw invalid(
      "additionalWages must be an array of explicitly dated payments.",
    );
  }

  const seenMonths = new Set<string>();
  return value.map((entry, index) => {
    const field = `additionalWages[${index}]`;
    if (!isRecord(entry)) throw invalid(`${field} must be an object.`);

    const contributionMonth = optionalString(
      entry.contributionMonth,
      `${field}.contributionMonth`,
    );
    if (
      !contributionMonth ||
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(contributionMonth)
    ) {
      throw invalid(`${field}.contributionMonth must be in YYYY-MM format.`);
    }
    if (seenMonths.has(contributionMonth)) {
      throw invalid(
        `additionalWages contains more than one payment for ${contributionMonth}; combine payments made in the same contribution month.`,
      );
    }
    seenMonths.add(contributionMonth);

    const amount = requiredPositiveNumber(entry.amount, `${field}.amount`);
    if (!isRecord(entry.additionalWageCeilingContext)) {
      throw invalid(
        `${field}.additionalWageCeilingContext is required for a positive Additional Wage payment.`,
      );
    }
    const context = entry.additionalWageCeilingContext;
    const hasRemaining = context.remainingAdditionalWageCeiling !== undefined;
    const hasAnnual = context.annualOrdinaryWagesSubjectToCpf !== undefined;
    const hasPrior = context.priorAdditionalWagesSubjectToCpf !== undefined;

    if (hasRemaining) {
      if (hasAnnual || hasPrior) {
        throw invalid(
          `${field}.additionalWageCeilingContext must provide either remainingAdditionalWageCeiling or both annualOrdinaryWagesSubjectToCpf and priorAdditionalWagesSubjectToCpf, not both forms.`,
        );
      }
      return {
        contributionMonth,
        amount,
        additionalWageCeilingContext: {
          remainingAdditionalWageCeiling: requiredNonNegativeNumber(
            context.remainingAdditionalWageCeiling,
            `${field}.additionalWageCeilingContext.remainingAdditionalWageCeiling`,
          ),
        },
      };
    }

    if (!hasAnnual || !hasPrior) {
      throw invalid(
        `${field}.additionalWageCeilingContext must provide both annualOrdinaryWagesSubjectToCpf and priorAdditionalWagesSubjectToCpf, or remainingAdditionalWageCeiling.`,
      );
    }
    return {
      contributionMonth,
      amount,
      additionalWageCeilingContext: {
        annualOrdinaryWagesSubjectToCpf: requiredNonNegativeNumber(
          context.annualOrdinaryWagesSubjectToCpf,
          `${field}.additionalWageCeilingContext.annualOrdinaryWagesSubjectToCpf`,
        ),
        priorAdditionalWagesSubjectToCpf: requiredNonNegativeNumber(
          context.priorAdditionalWagesSubjectToCpf,
          `${field}.additionalWageCeilingContext.priorAdditionalWagesSubjectToCpf`,
        ),
      },
    };
  });
}

function parseBalances(
  value: unknown,
  field = "initialBalances",
): AccountBalances {
  if (!isRecord(value)) {
    throw invalid(`${field} must be an object.`);
  }
  return {
    oa: requiredNonNegativeNumber(value.oa, `${field}.oa`),
    sa: requiredNonNegativeNumber(value.sa, `${field}.sa`),
    ma: requiredNonNegativeNumber(value.ma, `${field}.ma`),
    ra: requiredNonNegativeNumber(value.ra, `${field}.ra`),
  };
}

function parseVoluntaryTopUp(value: unknown): VoluntaryTopUp | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) throw invalid("voluntaryTopUp must be an object.");

  const amount = requiredPositiveNumber(value.amount, "voluntaryTopUp.amount");
  const account = value.account;
  if (
    account !== "retirement" &&
    account !== "MA" &&
    account !== "SA" &&
    account !== "RA"
  ) {
    throw invalid("voluntaryTopUp.account must be retirement, MA, SA, or RA.");
  }
  const frequency = value.frequency;
  if (frequency !== "monthly" && frequency !== "yearly") {
    throw invalid("voluntaryTopUp.frequency must be monthly or yearly.");
  }
  return { amount, account, frequency };
}

function parseRetirementTransfer(
  value: unknown,
): RetirementTransfer | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) throw invalid("retirementTransfer must be an object.");

  const amount = requiredPositiveNumber(
    value.amount,
    "retirementTransfer.amount",
  );
  const timing = value.timing;
  if (timing !== "now" && timing !== "monthly" && timing !== "yearly") {
    throw invalid("retirementTransfer.timing must be now, monthly, or yearly.");
  }
  return { amount, timing };
}

function parseLegacyTransfer(value: unknown): OaToSaTransfer | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) throw invalid("oaToSaTransfer must be an object.");

  const amount = requiredPositiveNumber(value.amount, "oaToSaTransfer.amount");
  const timing = value.timing;
  if (timing !== "now" && timing !== "yearly") {
    throw invalid("oaToSaTransfer.timing must be now or yearly.");
  }
  return { amount, timing };
}

function parseRetirementRouting(value: unknown): RetirementRouting | undefined {
  if (value === undefined) return undefined;
  if (
    value !== "full-retirement-sum" &&
    value !== "basic-retirement-sum-with-property"
  ) {
    throw invalid(
      "retirementRouting must be full-retirement-sum or basic-retirement-sum-with-property.",
    );
  }
  return value;
}

function parseCitizenship(
  value: unknown,
  allowDefault: boolean,
): CitizenshipStatus {
  if (value === undefined && allowDefault) return "citizen";
  if (
    value !== "citizen" &&
    value !== "spr-year1" &&
    value !== "spr-year2" &&
    value !== "spr-year3-plus"
  ) {
    throw invalid(
      "citizenship must be citizen, spr-year1, spr-year2, or spr-year3-plus.",
    );
  }
  return value;
}

function birthDateForCompletedAge(age: number, startMonth: string): string {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(startMonth);
  if (!match) throw invalid("startMonth must be in YYYY-MM format.");
  return `${match[2]}/${Number(match[1]) - age}`;
}

function requiredNonNegativeNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw invalid(`${field} must be a non-negative number.`);
  }
  return value;
}

function optionalNonNegativeNumber(
  value: unknown,
  field: string,
): number | undefined {
  if (value === undefined) return undefined;
  return requiredNonNegativeNumber(value, field);
}

function requiredPositiveNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw invalid(`${field} must be a positive number.`);
  }
  return value;
}

function requiredWholeNumber(
  value: unknown,
  field: string,
  minimum: number,
): number {
  if (
    !Number.isInteger(value) ||
    typeof value !== "number" ||
    value < minimum
  ) {
    throw invalid(`${field} must be a whole number of at least ${minimum}.`);
  }
  return value;
}

function optionalWholeNumber(
  value: unknown,
  field: string,
  minimum: number,
): number | undefined {
  if (value === undefined) return undefined;
  return requiredWholeNumber(value, field, minimum);
}

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.length === 0) {
    throw invalid(`${field} must be a non-empty string.`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalid(message: string): ProjectionRequestError {
  return new ProjectionRequestError(message);
}

function buildLegacyProjections(
  result: ReturnType<typeof calculateCpfProjection>,
): Array<Record<string, unknown>> {
  let cumulativeEmployee = 0;
  let cumulativeEmployer = 0;
  let cumulativeTotal = 0;

  return result.yearlyBalances.map((entry) => {
    cumulativeEmployee += entry.contributions.employee;
    cumulativeEmployer += entry.contributions.employer;
    cumulativeTotal += entry.contributions.total;
    return {
      year: entry.year,
      age: entry.age,
      ageGroup: entry.ageGroup,
      contribution: {
        employee: entry.contributions.employee,
        employer: entry.contributions.employer,
        totalContribution: entry.contributions.total,
      },
      cumulative: {
        employee: Math.round(cumulativeEmployee * 100) / 100,
        employer: Math.round(cumulativeEmployer * 100) / 100,
        totalContribution: Math.round(cumulativeTotal * 100) / 100,
      },
    };
  });
}
