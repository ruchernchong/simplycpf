"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { ProjectionResult } from "@/types";

interface ScenarioComparisonChartProps {
  baseline: ProjectionResult;
  scenario: ProjectionResult;
  baselineLabel: string;
  scenarioLabel: string;
}

function getTotalBalance(result: ProjectionResult, age: number): number | null {
  const yearlyBalance = result.yearlyBalances.find(
    (entry) => entry.age === age,
  );

  if (!yearlyBalance) {
    return null;
  }

  return (
    yearlyBalance.balances.oa +
    yearlyBalance.balances.sa +
    yearlyBalance.balances.ma +
    yearlyBalance.balances.ra
  );
}

export default function ScenarioComparisonChart({
  baseline,
  scenario,
  baselineLabel,
  scenarioLabel,
}: ScenarioComparisonChartProps) {
  const ages = Array.from(
    new Set([
      ...baseline.yearlyBalances.map(({ age }) => age),
      ...scenario.yearlyBalances.map(({ age }) => age),
    ]),
  ).sort((firstAge, secondAge) => firstAge - secondAge);

  const chartData = ages.map((age) => ({
    age,
    baseline: getTotalBalance(baseline, age),
    scenario: getTotalBalance(scenario, age),
  }));

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Scenario Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          role="img"
          aria-label="Line chart comparing projected CPF balances for the baseline and selected what-if scenario"
        >
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="age" />
              <YAxis tickFormatter={(value) => formatCurrency(value, 0)} />
              <Tooltip
                formatter={(value) =>
                  value === null
                    ? "Not started"
                    : formatCurrency(Number(value), 0)
                }
                labelFormatter={(value) => `Age ${value}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="baseline"
                name={baselineLabel}
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="scenario"
                name={scenarioLabel}
                stroke="#0f766e"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
