import { NextResponse } from "next/server";
import { CACHE_HEADERS } from "@/lib/cache-headers";
import { calculateCpfContribution } from "@/lib/calculate-cpf-contribution";
import {
  ContributionPolicyError,
  POLICY_SOURCES,
  resolveContributionAgeFromBirthMonth,
} from "@/policy";

interface AgeConversionWarning {
  code: "deprecated-birth-date-alias" | "contribution-month-defaulted";
  message: string;
}

export const GET = async (request: Request): Promise<NextResponse> => {
  const searchParams = new URL(request.url).searchParams;
  const birthMonthInput = searchParams.get("birthMonth");
  const birthDateAlias = searchParams.get("birthDate");

  if ((birthMonthInput === null) === (birthDateAlias === null)) {
    return invalidInput(
      "Supply exactly one of birthMonth or the deprecated birthDate alias.",
    );
  }

  const warnings: AgeConversionWarning[] = [];
  let birthMonth = birthMonthInput;
  if (birthDateAlias !== null) {
    try {
      birthMonth = convertLegacyBirthDate(birthDateAlias);
    } catch (error) {
      if (error instanceof ContributionPolicyError) {
        return invalidInput(error.message);
      }
      throw error;
    }
    warnings.push({
      code: "deprecated-birth-date-alias",
      message:
        "birthDate=MM/YYYY is deprecated; use birthMonth=YYYY-MM for one-cycle compatibility.",
    });
  }

  let contributionMonth = searchParams.get("contributionMonth");
  const contributionMonthDefaulted = contributionMonth === null;
  if (contributionMonthDefaulted) {
    if (birthDateAlias === null) {
      return invalidInput("contributionMonth is required with birthMonth.");
    }
    contributionMonth = currentSingaporeMonth();
    warnings.push({
      code: "contribution-month-defaulted",
      message:
        "contributionMonth defaulted to the current Singapore month for legacy compatibility; supply it explicitly for deterministic results.",
    });
  }

  try {
    if (birthMonth === null || contributionMonth === null) {
      throw new ContributionPolicyError(
        "INVALID_INPUT",
        "birthMonth and contributionMonth are required.",
      );
    }

    const age = resolveContributionAgeFromBirthMonth(
      birthMonth,
      contributionMonth,
    );
    const calculation = calculateCpfContribution({
      birthMonth: age.birthMonth,
      contributionMonth: age.contributionMonth,
      ordinaryWages: 0,
      citizenship: "citizen",
    });
    const legacyFields =
      birthDateAlias === null
        ? {}
        : { birthDate: birthDateAlias, age: age.completedAge };

    return NextResponse.json(
      {
        ...legacyFields,
        birthMonth: age.birthMonth,
        contributionMonth: age.contributionMonth,
        completedAge: age.completedAge,
        ageInMonths: age.ageInMonths,
        isBirthdayMonth: age.isBirthdayMonth,
        cpfRateTransition: {
          contributionBand: calculation.age.contributionBand,
          allocationBand: calculation.age.allocationBand,
          nextAgeBandStartsMonthAfterBirthday:
            age.nextAgeBandStartsMonthAfterBirthday,
        },
        schedule: {
          id: calculation.schedule.id,
          effectiveFrom: calculation.schedule.effectiveFrom,
          effectiveTo: calculation.schedule.effectiveTo,
          status: calculation.schedule.status,
        },
        policy: {
          contribution: calculation.policy.contribution,
          allocation: calculation.policy.allocation,
          ageTransition: {
            status: "official",
            verifiedAt: calculation.policy.contribution.verifiedAt,
            sources: [POLICY_SOURCES.ageGroupTransition],
          },
        },
        warnings,
      },
      {
        status: 200,
        headers: contributionMonthDefaulted
          ? { "Cache-Control": "private, no-store" }
          : CACHE_HEADERS.policy,
      },
    );
  } catch (error) {
    if (error instanceof ContributionPolicyError) {
      const status = error.code === "UNSUPPORTED_POLICY_MONTH" ? 404 : 422;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }
    return NextResponse.json(
      { error: "Unable to resolve age from birth month." },
      { status: 500 },
    );
  }
};

function convertLegacyBirthDate(value: string): string {
  const match = /^(0[1-9]|1[0-2])\/(\d{4})$/.exec(value);
  if (!match) {
    throw new ContributionPolicyError(
      "INVALID_INPUT",
      "birthDate must be in MM/YYYY format.",
    );
  }
  return `${match[2]}-${match[1]}`;
}

function currentSingaporeMonth(): string {
  const parts = new Intl.DateTimeFormat("en-SG", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  if (!year || !month) {
    throw new Error("Unable to determine the current Singapore month.");
  }
  return `${year}-${month}`;
}

function invalidInput(message: string): NextResponse {
  return NextResponse.json(
    { error: message, code: "INVALID_INPUT" },
    { status: 422 },
  );
}
