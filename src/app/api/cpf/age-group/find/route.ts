import { NextResponse } from "next/server";
import {
  findPolicyAgeGroup,
  isContributionCitizenship,
  parseAgeInput,
} from "@/app/api/cpf/age-groups/policy-age-groups";
import { CACHE_HEADERS } from "@/lib/cache-headers";
import { ContributionPolicyError } from "@/policy";

export const GET = async (request: Request): Promise<NextResponse> => {
  const searchParams = new URL(request.url).searchParams;
  const contributionMonth = searchParams.get("contributionMonth");
  const citizenshipValue = searchParams.get("citizenship") ?? "citizen";

  if (!contributionMonth) {
    return NextResponse.json(
      {
        error: "contributionMonth is required.",
        code: "INVALID_INPUT",
      },
      { status: 422 },
    );
  }
  if (!isContributionCitizenship(citizenshipValue)) {
    return NextResponse.json(
      { error: "Unsupported citizenship value.", code: "INVALID_INPUT" },
      { status: 422 },
    );
  }

  try {
    const input = parseAgeInput(
      contributionMonth,
      citizenshipValue,
      searchParams.get("age"),
      searchParams.get("birthMonth"),
    );
    const { ageGroup, ageGroups: _, ...context } = findPolicyAgeGroup(input);
    return NextResponse.json(
      { ...ageGroup, completedAge: context.completedAge, ...context },
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
      { error: "Unable to resolve the CPF age group." },
      { status: 500 },
    );
  }
};
