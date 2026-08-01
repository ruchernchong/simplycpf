import { NextResponse } from "next/server";
import { CPF_BASIC_HEALTHCARE_SUM, getBhsForYear } from "@/constants/cpf-bhs";
import { CACHE_HEADERS } from "@/lib/cache-headers";
import { getPolicyMetadata } from "@/policy";

const publishedYears = Object.keys(CPF_BASIC_HEALTHCARE_SUM)
  .map(Number)
  .sort((a, b) => a - b);
const latestPublishedYear = publishedYears.at(-1) as number;

function metadataForYear(year: number) {
  return getPolicyMetadata("cpf-basic-healthcare-sum", {
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

    if (CPF_BASIC_HEALTHCARE_SUM[String(yearNumber)] === undefined) {
      return NextResponse.json(
        {
          error: `No official Basic Healthcare Sum is published for ${yearNumber}`,
          supportedYears: publishedYears,
        },
        { status: 404, headers: CACHE_HEADERS.policy },
      );
    }

    return NextResponse.json(
      {
        year: yearNumber,
        bhs: getBhsForYear(yearNumber),
        status: "official",
        metadata: metadataForYear(yearNumber),
      },
      { status: 200, headers: CACHE_HEADERS.policy },
    );
  }

  return NextResponse.json(
    {
      years: CPF_BASIC_HEALTHCARE_SUM,
      observations: publishedYears.map((publishedYear) => ({
        year: publishedYear,
        bhs: getBhsForYear(publishedYear),
        status: "official" as const,
      })),
      latestPublishedYear,
      latestPublished: getBhsForYear(latestPublishedYear),
      metadata: getPolicyMetadata("cpf-basic-healthcare-sum", {
        version: `${publishedYears[0]}-${latestPublishedYear}`,
        effectiveFrom: `${publishedYears[0]}-01-01`,
        effectiveTo: `${latestPublishedYear}-12-31`,
      }),
    },
    { status: 200, headers: CACHE_HEADERS.policy },
  );
}
