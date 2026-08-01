import { NextResponse } from "next/server";
import {
  CPF_RETIREMENT_SUMS,
  getRetirementSumsForYear,
} from "@/constants/cpf-retirement-sums";
import { CACHE_HEADERS } from "@/lib/cache-headers";
import { getPolicyMetadata } from "@/policy";

const publishedYears = Object.keys(CPF_RETIREMENT_SUMS)
  .map(Number)
  .sort((a, b) => a - b);
const latestPublishedYear = publishedYears.at(-1) as number;

function metadataForYear(year: number) {
  return getPolicyMetadata("cpf-retirement-sums", {
    version: String(year),
    effectiveFrom: `${year}-01-01`,
    effectiveTo: `${year}-12-31`,
  });
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");

  if (year) {
    const yearNumber = Number(year);

    if (!Number.isInteger(yearNumber) || year.length !== 4) {
      return NextResponse.json(
        { error: "year must be a valid year" },
        { status: 422 },
      );
    }

    if (CPF_RETIREMENT_SUMS[String(yearNumber)] === undefined) {
      return NextResponse.json(
        {
          error: `No official CPF retirement sums are published for ${yearNumber}`,
          supportedYears: publishedYears,
        },
        { status: 404, headers: CACHE_HEADERS.policy },
      );
    }

    return NextResponse.json(
      {
        year: yearNumber,
        ...getRetirementSumsForYear(yearNumber),
        status: "official",
        metadata: metadataForYear(yearNumber),
      },
      { status: 200, headers: CACHE_HEADERS.policy },
    );
  }

  return NextResponse.json(
    {
      years: CPF_RETIREMENT_SUMS,
      observations: publishedYears.map((publishedYear) => ({
        year: publishedYear,
        ...getRetirementSumsForYear(publishedYear),
        status: "official" as const,
      })),
      latestPublishedYear,
      latestPublished: getRetirementSumsForYear(latestPublishedYear),
      metadata: getPolicyMetadata("cpf-retirement-sums", {
        version: `${publishedYears[0]}-${latestPublishedYear}`,
        effectiveFrom: `${publishedYears[0]}-01-01`,
        effectiveTo: `${latestPublishedYear}-12-31`,
      }),
    },
    { status: 200, headers: CACHE_HEADERS.policy },
  );
}
