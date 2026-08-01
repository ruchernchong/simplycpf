import { NextResponse } from "next/server";
import { CACHE_HEADERS } from "@/lib/cache-headers";
import { calculateInterestTrend } from "@/lib/calculate-interest-trend";

export const GET = async (): Promise<NextResponse> => {
  const trendData = calculateInterestTrend();

  return NextResponse.json(trendData, {
    status: 200,
    headers: CACHE_HEADERS.policy,
  });
};
