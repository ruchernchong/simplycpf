import { type NextRequest, NextResponse } from "next/server";
import { calculateCpfProjection } from "@/lib/calculate-cpf-projection";
import type {
  CitizenshipStatus,
  OaToSaTransfer,
  ProjectionParams,
  VoluntaryTopUp,
} from "@/types";

interface LegacyProjectionRequest {
  income?: number;
  age?: number;
  years?: number;
}

interface FullProjectionRequest {
  monthlyIncome?: number;
  birthDate?: string;
  startAge?: number;
  endAge?: number;
  housingWithdrawal?: number;
  voluntaryTopUp?: VoluntaryTopUp;
  oaToSaTransfer?: OaToSaTransfer;
  citizenship?: CitizenshipStatus;
}

type ProjectionRequest = LegacyProjectionRequest & FullProjectionRequest;

const MAX_YEARS = 50;

const citizenshipStatuses: CitizenshipStatus[] = [
  "citizen",
  "spr-year1",
  "spr-year2",
  "spr-year3-plus",
];
const topUpAccounts: VoluntaryTopUp["account"][] = ["SA", "MA", "RA"];
const topUpFrequencies: VoluntaryTopUp["frequency"][] = ["monthly", "yearly"];
const transferTimings: OaToSaTransfer["timing"][] = ["now", "yearly"];

function isCitizenshipStatus(value: unknown): value is CitizenshipStatus {
  return (
    typeof value === "string" &&
    citizenshipStatuses.includes(value as CitizenshipStatus)
  );
}

function isTopUpAccount(value: unknown): value is VoluntaryTopUp["account"] {
  return (
    typeof value === "string" &&
    topUpAccounts.includes(value as VoluntaryTopUp["account"])
  );
}

function isTopUpFrequency(
  value: unknown,
): value is VoluntaryTopUp["frequency"] {
  return (
    typeof value === "string" &&
    topUpFrequencies.includes(value as VoluntaryTopUp["frequency"])
  );
}

function isTransferTiming(value: unknown): value is OaToSaTransfer["timing"] {
  return (
    typeof value === "string" &&
    transferTimings.includes(value as OaToSaTransfer["timing"])
  );
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && value >= 0;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && value > 0;
}

function buildLegacyProjections(
  result: ReturnType<typeof calculateCpfProjection>,
) {
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

function validateTopUp(topUp: unknown): string | null {
  if (topUp === undefined) {
    return null;
  }

  if (typeof topUp !== "object" || topUp === null) {
    return "voluntaryTopUp must be an object";
  }

  const candidate = topUp as Partial<VoluntaryTopUp>;

  if (!isPositiveNumber(candidate.amount)) {
    return "voluntaryTopUp.amount must be a positive number";
  }

  if (!isTopUpAccount(candidate.account)) {
    return "voluntaryTopUp.account must be SA, MA, or RA";
  }

  if (!isTopUpFrequency(candidate.frequency)) {
    return "voluntaryTopUp.frequency must be monthly or yearly";
  }

  return null;
}

function validateTransfer(transfer: unknown): string | null {
  if (transfer === undefined) {
    return null;
  }

  if (typeof transfer !== "object" || transfer === null) {
    return "oaToSaTransfer must be an object";
  }

  const candidate = transfer as Partial<OaToSaTransfer>;

  if (!isPositiveNumber(candidate.amount)) {
    return "oaToSaTransfer.amount must be a positive number";
  }

  if (!isTransferTiming(candidate.timing)) {
    return "oaToSaTransfer.timing must be now or yearly";
  }

  return null;
}

function normalizeProjectionRequest(body: ProjectionRequest):
  | {
      projectionParams: ProjectionParams;
      responseInput: Record<string, unknown>;
    }
  | { error: string } {
  const usingLegacyFields =
    body.income !== undefined ||
    body.age !== undefined ||
    body.years !== undefined;

  if (usingLegacyFields) {
    if (body.income === undefined || body.income === null) {
      return { error: "income is required" };
    }

    if (!isNonNegativeNumber(body.income)) {
      return { error: "income must be a non-negative number" };
    }

    if (body.age === undefined || body.age === null) {
      return { error: "age is required" };
    }

    if (!isNonNegativeNumber(body.age)) {
      return { error: "age must be a non-negative number" };
    }

    if (body.years === undefined || body.years === null) {
      return { error: "years is required" };
    }

    if (!isPositiveNumber(body.years)) {
      return { error: "years must be a positive number" };
    }

    if (body.years > MAX_YEARS) {
      return { error: `Maximum ${MAX_YEARS} years allowed` };
    }

    return {
      projectionParams: {
        monthlyIncome: body.income,
        birthDate: body.birthDate ?? "",
        startAge: body.age,
        endAge: body.age + body.years - 1,
        housingWithdrawal: body.housingWithdrawal,
        voluntaryTopUp: body.voluntaryTopUp,
        oaToSaTransfer: body.oaToSaTransfer,
        citizenship: body.citizenship ?? "citizen",
      },
      responseInput: {
        income: body.income,
        age: body.age,
        years: body.years,
      },
    };
  }

  if (body.monthlyIncome === undefined || body.monthlyIncome === null) {
    return { error: "monthlyIncome is required" };
  }

  if (!isNonNegativeNumber(body.monthlyIncome)) {
    return { error: "monthlyIncome must be a non-negative number" };
  }

  if (body.startAge !== undefined && !isNonNegativeNumber(body.startAge)) {
    return { error: "startAge must be a non-negative number" };
  }

  if (body.endAge !== undefined && !isPositiveNumber(body.endAge)) {
    return { error: "endAge must be a positive number" };
  }

  if (
    body.startAge === undefined &&
    (body.birthDate === undefined || body.birthDate.length === 0)
  ) {
    return { error: "birthDate or startAge is required" };
  }

  if (
    body.startAge !== undefined &&
    body.endAge !== undefined &&
    body.endAge < body.startAge
  ) {
    return { error: "endAge must be greater than or equal to startAge" };
  }

  if (
    body.startAge !== undefined &&
    body.endAge !== undefined &&
    body.endAge - body.startAge + 1 > MAX_YEARS
  ) {
    return { error: `Maximum ${MAX_YEARS} years allowed` };
  }

  if (
    body.housingWithdrawal !== undefined &&
    !isNonNegativeNumber(body.housingWithdrawal)
  ) {
    return { error: "housingWithdrawal must be a non-negative number" };
  }

  if (
    body.citizenship !== undefined &&
    !isCitizenshipStatus(body.citizenship)
  ) {
    return {
      error:
        "citizenship must be citizen, spr-year1, spr-year2, or spr-year3-plus",
    };
  }

  const topUpError = validateTopUp(body.voluntaryTopUp);
  if (topUpError) {
    return { error: topUpError };
  }

  const transferError = validateTransfer(body.oaToSaTransfer);
  if (transferError) {
    return { error: transferError };
  }

  return {
    projectionParams: {
      monthlyIncome: body.monthlyIncome,
      birthDate: body.birthDate ?? "",
      ...(body.startAge !== undefined ? { startAge: body.startAge } : {}),
      ...(body.endAge !== undefined ? { endAge: body.endAge } : {}),
      ...(body.housingWithdrawal !== undefined
        ? { housingWithdrawal: body.housingWithdrawal }
        : {}),
      ...(body.voluntaryTopUp ? { voluntaryTopUp: body.voluntaryTopUp } : {}),
      ...(body.oaToSaTransfer ? { oaToSaTransfer: body.oaToSaTransfer } : {}),
      citizenship: body.citizenship ?? "citizen",
    },
    responseInput: {
      monthlyIncome: body.monthlyIncome,
      ...(body.birthDate ? { birthDate: body.birthDate } : {}),
      ...(body.startAge !== undefined ? { startAge: body.startAge } : {}),
      ...(body.endAge !== undefined ? { endAge: body.endAge } : {}),
      ...(body.housingWithdrawal !== undefined
        ? { housingWithdrawal: body.housingWithdrawal }
        : {}),
      ...(body.voluntaryTopUp ? { voluntaryTopUp: body.voluntaryTopUp } : {}),
      ...(body.oaToSaTransfer ? { oaToSaTransfer: body.oaToSaTransfer } : {}),
      citizenship: body.citizenship ?? "citizen",
    },
  };
}

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body: ProjectionRequest = await request.json();
    const normalized = normalizeProjectionRequest(body);

    if ("error" in normalized) {
      return NextResponse.json({ error: normalized.error }, { status: 400 });
    }

    const result = calculateCpfProjection(normalized.projectionParams);
    const projections = buildLegacyProjections(result);

    return NextResponse.json(
      {
        ...result,
        input: normalized.responseInput,
        projectionInput: result.input,
        projections,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
};
