import { type NextRequest, NextResponse } from "next/server";
import { calculateCpfContribution } from "@/lib/calculate-cpf-contribution";
import { ContributionPolicyError } from "@/policy";
import { parseContributionRequest } from "./contribution-request";

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
    const parsed = parseContributionRequest(body);
    const result = calculateCpfContribution(parsed.input);

    return NextResponse.json(
      {
        ...result,
        warnings: [...result.warnings, ...parsed.warnings],
      },
      { status: 200 },
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
      { error: "Unable to calculate CPF contributions." },
      { status: 500 },
    );
  }
};
