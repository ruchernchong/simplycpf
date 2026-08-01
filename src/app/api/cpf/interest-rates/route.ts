import { NextResponse } from "next/server";
import { CACHE_HEADERS } from "@/lib/cache-headers";
import { CPF_POLICY_CATALOGUE } from "@/policy";

export const GET = async (): Promise<NextResponse> => {
  const latest = CPF_POLICY_CATALOGUE.quarterlyInterestRates.at(-1);
  return NextResponse.json(
    {
      quarterlyRates: CPF_POLICY_CATALOGUE.quarterlyInterestRates,
      methodology: CPF_POLICY_CATALOGUE.interestRateMethodology,
      metadata: {
        ...CPF_POLICY_CATALOGUE.metadata["cpf-interest-rates"],
        latestPublishedQuarter: latest?.quarter,
      },
    },
    {
      status: 200,
      headers: CACHE_HEADERS.policy,
    },
  );
};
