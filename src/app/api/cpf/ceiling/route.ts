import { type NextRequest, NextResponse } from "next/server";
import { CACHE_HEADERS } from "@/lib/cache-headers";
import { ContributionPolicyError, resolveContributionSchedule } from "@/policy";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const searchParams = request.nextUrl.searchParams;
  const contributionMonth =
    searchParams.get("contributionMonth") ?? searchParams.get("date");
  if (!contributionMonth) {
    return NextResponse.json(
      {
        error: "contributionMonth is required.",
        code: "INVALID_INPUT",
      },
      { status: 422 },
    );
  }

  try {
    const { schedule } = resolveContributionSchedule(contributionMonth);
    const warnings = searchParams.has("date")
      ? [
          {
            code: "legacy-input",
            message:
              "date is a deprecated alias; use contributionMonth instead.",
          },
        ]
      : [];
    return NextResponse.json(
      {
        contributionMonth: contributionMonth.slice(0, 7),
        effectiveFrom: schedule.effectiveFrom,
        effectiveTo: schedule.effectiveTo,
        ordinaryWageCeiling: schedule.ordinaryWageCeiling,
        additionalWageCeiling: schedule.additionalWageCeiling,
        warnings,
        policy: schedule.wageCeilingMetadata,
      },
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
      { error: "Unable to load the CPF wage ceiling." },
      { status: 500 },
    );
  }
};
