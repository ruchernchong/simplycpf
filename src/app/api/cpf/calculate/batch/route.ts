import { type NextRequest, NextResponse } from "next/server";
import { calculateCpfContribution } from "@/lib/calculate-cpf-contribution";
import { ContributionPolicyError } from "@/policy";
import { parseContributionRequest } from "../contribution-request";

const MAX_SCENARIOS = 100;

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

  if (!isRecord(body) || !Array.isArray(body.scenarios)) {
    return NextResponse.json(
      { error: "scenarios array is required" },
      { status: 422 },
    );
  }
  if (body.scenarios.length === 0) {
    return NextResponse.json(
      { error: "scenarios array cannot be empty" },
      { status: 422 },
    );
  }
  if (body.scenarios.length > MAX_SCENARIOS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_SCENARIOS} scenarios allowed per request` },
      { status: 422 },
    );
  }

  try {
    const results = body.scenarios.map((scenario, index) => {
      try {
        const parsed = parseContributionRequest(scenario);
        const result = calculateCpfContribution(parsed.input);
        return {
          ...result,
          warnings: [...result.warnings, ...parsed.warnings],
        };
      } catch (error) {
        if (error instanceof ContributionPolicyError) {
          throw new ContributionPolicyError(
            error.code,
            `Scenario ${index}: ${error.message}`,
          );
        }
        throw error;
      }
    });

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    if (error instanceof ContributionPolicyError) {
      const status = error.code === "UNSUPPORTED_POLICY_MONTH" ? 404 : 422;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }

    return NextResponse.json(
      { error: "Unable to calculate CPF contributions." },
      { status: 500 },
    );
  }
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
