import { NextResponse } from "next/server";
import { CACHE_HEADERS } from "@/lib/cache-headers";
import {
  calculateSmraRate,
  isFloorRateApplied,
} from "@/lib/calculate-interest-trend";
import { CPF_POLICY_CATALOGUE, CPF_SMRA_PEGGED_RATE_MARKUP } from "@/policy";
import { loadSearchParams } from "./search-params";

export const GET = async (request: Request): Promise<NextResponse> => {
  const methodology =
    CPF_POLICY_CATALOGUE.interestRateMethodology
      .specialMediSaveRetirementAccounts;
  const { averageSgsYield, sgsYield } = await loadSearchParams(request);
  const resolvedAverage = averageSgsYield ?? sgsYield;
  const usedDeprecatedAlias = averageSgsYield === null && sgsYield !== null;

  if (resolvedAverage === null) {
    return NextResponse.json(
      { error: "averageSgsYield is required" },
      { status: 422 },
    );
  }

  if (!Number.isFinite(resolvedAverage) || resolvedAverage < 0) {
    return NextResponse.json(
      { error: "averageSgsYield must be a non-negative number" },
      { status: 422 },
    );
  }

  const peggedRate = resolvedAverage + CPF_SMRA_PEGGED_RATE_MARKUP;
  const floorApplied = isFloorRateApplied(resolvedAverage);
  const actualRate = calculateSmraRate(resolvedAverage);

  return NextResponse.json(
    {
      averageSgsYield: resolvedAverage,
      peggedRate,
      floorApplied,
      actualRate,
      methodology: `${methodology.peg}, plus ${methodology.markupPercentagePoints} percentage point, subject to the ${methodology.floorRate}% floor`,
      policy: {
        ...CPF_POLICY_CATALOGUE.metadata["cpf-interest-rates"],
        // Retained for clients of the initial v2 preview; `sources` is the
        // canonical PolicyMetadata field.
        sourceUrls: CPF_POLICY_CATALOGUE.interestRateMethodology.sourceUrls,
      },
      warnings: usedDeprecatedAlias
        ? ["sgsYield is deprecated; use averageSgsYield"]
        : [],
    },
    { status: 200, headers: CACHE_HEADERS.policy },
  );
};
