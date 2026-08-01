import { NextResponse } from "next/server";
import { CACHE_HEADERS } from "@/lib/cache-headers";
import { calculateInterestTrend } from "@/lib/calculate-interest-trend";
import { CPF_POLICY_CATALOGUE } from "@/policy";

export const GET = async (): Promise<NextResponse> => {
  const trendData = calculateInterestTrend();

  return NextResponse.json(
    {
      observations: trendData,
      methodology: CPF_POLICY_CATALOGUE.interestRateMethodology,
      policy: CPF_POLICY_CATALOGUE.metadata["cpf-interest-rates"],
    },
    { status: 200, headers: CACHE_HEADERS.policy },
  );
};
