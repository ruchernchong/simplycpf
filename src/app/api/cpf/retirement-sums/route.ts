import { NextResponse } from "next/server";
import {
  CPF_RETIREMENT_SUMS,
  getRetirementSumsForYear,
} from "@/constants/cpf-retirement-sums";
import { CACHE_HEADERS } from "@/lib/cache-headers";

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");

  if (year) {
    const yearNumber = Number(year);

    if (!Number.isInteger(yearNumber) || yearNumber < 1900) {
      return NextResponse.json(
        { error: "year must be a valid year" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        year: yearNumber,
        ...getRetirementSumsForYear(yearNumber),
      },
      { status: 200, headers: CACHE_HEADERS.static },
    );
  }

  return NextResponse.json(
    {
      years: CPF_RETIREMENT_SUMS,
      currentYear: new Date().getFullYear(),
      current: getRetirementSumsForYear(new Date().getFullYear()),
    },
    { status: 200, headers: CACHE_HEADERS.immutable },
  );
}
