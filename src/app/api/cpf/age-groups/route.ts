import { type NextRequest, NextResponse } from "next/server";
import { CACHE_HEADERS } from "@/lib/cache-headers";
import { ContributionPolicyError, POLICY_METADATA } from "@/policy";
import {
  getPolicyAgeGroups,
  isContributionCitizenship,
} from "./policy-age-groups";

export const GET = async (request?: NextRequest): Promise<NextResponse> => {
  const searchParams = request?.nextUrl.searchParams;
  const contributionMonth =
    searchParams?.get("contributionMonth") ??
    POLICY_METADATA["cpf-contribution-rates"].verifiedAt.slice(0, 7);
  const citizenshipValue = searchParams?.get("citizenship") ?? "citizen";

  if (!isContributionCitizenship(citizenshipValue)) {
    return NextResponse.json(
      { error: "Unsupported citizenship value.", code: "INVALID_INPUT" },
      { status: 422 },
    );
  }

  try {
    return NextResponse.json(
      getPolicyAgeGroups(contributionMonth, citizenshipValue),
      { status: 200, headers: CACHE_HEADERS.policy },
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
      { error: "Unable to load CPF age groups." },
      { status: 500 },
    );
  }
};
