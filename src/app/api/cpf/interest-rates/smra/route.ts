import { NextResponse } from "next/server";
import { PEGGED_RATE_MARKUP } from "@/constants/cpf-interest-rates";
import { CACHE_HEADERS } from "@/lib/cache-headers";
import {
  calculateSmraRate,
  isFloorRateApplied,
} from "@/lib/calculate-interest-trend";
import { loadSearchParams } from "./search-params";

export const GET = async (request: Request): Promise<NextResponse> => {
  const { averageSgsYield, sgsYield } = await loadSearchParams(request);
  const resolvedAverage = averageSgsYield ?? sgsYield;
  const usedDeprecatedAlias = averageSgsYield === null && sgsYield !== null;

  if (resolvedAverage === null) {
    return NextResponse.json(
      { error: "averageSgsYield is required" },
      { status: 400 },
    );
  }

  if (resolvedAverage < 0) {
    return NextResponse.json(
      { error: "averageSgsYield must be a non-negative number" },
      { status: 400 },
    );
  }

  const peggedRate = resolvedAverage + PEGGED_RATE_MARKUP;
  const floorApplied = isFloorRateApplied(resolvedAverage);
  const actualRate = calculateSmraRate(resolvedAverage);

  return NextResponse.json(
    {
      averageSgsYield: resolvedAverage,
      peggedRate,
      floorApplied,
      actualRate,
      methodology:
        "12-month average yield of 10-year Singapore Government Securities plus 1 percentage point, subject to the current 4% floor",
      warnings: usedDeprecatedAlias
        ? ["sgsYield is deprecated; use averageSgsYield"]
        : [],
    },
    { status: 200, headers: CACHE_HEADERS.policy },
  );
};
