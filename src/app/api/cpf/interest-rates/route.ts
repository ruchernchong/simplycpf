import { NextResponse } from "next/server";
import {
  CPF_INTEREST_RATE_METHODOLOGY,
  QUARTERLY_CPF_RATES,
} from "@/constants/cpf-interest-rates";
import { CACHE_HEADERS } from "@/lib/cache-headers";

export const GET = async (): Promise<NextResponse> => {
  return NextResponse.json(
    {
      quarterlyRates: QUARTERLY_CPF_RATES,
      methodology: CPF_INTEREST_RATE_METHODOLOGY,
      metadata: {
        status: "official",
        verifiedAt: "2026-08-01",
        latestPublishedQuarter: "2026 Q3",
      },
    },
    {
      status: 200,
      headers: CACHE_HEADERS.policy,
    },
  );
};
