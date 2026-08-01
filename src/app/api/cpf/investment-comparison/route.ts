import { type NextRequest, NextResponse } from "next/server";

interface Scenario {
  name: string;
  rate: number;
}

interface InvestmentComparisonRequest {
  principal: number;
  years: number;
  scenarios: Scenario[];
}

interface ScenarioResult {
  name: string;
  rate: number;
  finalValue: number;
  totalGrowth: number;
  growthPercentage: number;
}

const MAX_YEARS = 50;
const MAX_SCENARIOS = 10;

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body: InvestmentComparisonRequest = await request.json();
    const { principal, years, scenarios } = body;

    if (principal === undefined || principal === null) {
      return NextResponse.json(
        { error: "principal is required" },
        { status: 400 },
      );
    }

    if (typeof principal !== "number" || principal < 0) {
      return NextResponse.json(
        { error: "principal must be a non-negative number" },
        { status: 400 },
      );
    }

    if (years === undefined || years === null) {
      return NextResponse.json({ error: "years is required" }, { status: 400 });
    }

    if (!Number.isInteger(years) || years < 1) {
      return NextResponse.json(
        { error: "years must be a positive whole number" },
        { status: 400 },
      );
    }

    if (years > MAX_YEARS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_YEARS} years allowed` },
        { status: 400 },
      );
    }

    if (!scenarios || !Array.isArray(scenarios)) {
      return NextResponse.json(
        { error: "scenarios array is required" },
        { status: 400 },
      );
    }

    if (scenarios.length === 0) {
      return NextResponse.json(
        { error: "scenarios array cannot be empty" },
        { status: 400 },
      );
    }

    if (scenarios.length > MAX_SCENARIOS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_SCENARIOS} scenarios allowed` },
        { status: 400 },
      );
    }

    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];

      if (!scenario.name || typeof scenario.name !== "string") {
        return NextResponse.json(
          { error: `Scenario ${i}: name is required` },
          { status: 400 },
        );
      }

      if (scenario.rate === undefined || typeof scenario.rate !== "number") {
        return NextResponse.json(
          { error: `Scenario ${i}: rate is required and must be a number` },
          { status: 400 },
        );
      }
    }

    const results: ScenarioResult[] = scenarios.map((scenario) => {
      const finalValue = principal * (1 + scenario.rate / 100) ** years;
      const totalGrowth = finalValue - principal;
      const growthPercentage =
        principal > 0 ? (totalGrowth / principal) * 100 : 0;

      return {
        name: scenario.name,
        rate: scenario.rate,
        finalValue: Math.round(finalValue * 100) / 100,
        totalGrowth: Math.round(totalGrowth * 100) / 100,
        growthPercentage: Math.round(growthPercentage * 100) / 100,
      };
    });

    return NextResponse.json(
      {
        input: { principal, years },
        results,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
};
