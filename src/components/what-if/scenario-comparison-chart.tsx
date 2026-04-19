"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProjectionResult } from "@/types";

interface ScenarioComparisonChartProps {
  baseline: ProjectionResult;
  scenario: ProjectionResult;
  baselineLabel: string;
  scenarioLabel: string;
}

function getTotalBalance(result: ProjectionResult, age: number): number {
  const yearlyBalance = result.yearlyBalances.find(
    (entry) => entry.age === age,
  );
  if (!yearlyBalance) return 0;
  return (
    yearlyBalance.balances.oa +
    yearlyBalance.balances.sa +
    yearlyBalance.balances.ma +
    yearlyBalance.balances.ra
  );
}

function compactCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${Math.round(value / 1_000)}k`;
  }
  return `$${value}`;
}

function ChartPanel({
  label,
  result,
  highlight,
}: {
  label: string;
  result: ProjectionResult;
  highlight?: boolean;
}) {
  const ages = result.yearlyBalances.map(({ age }) => age);
  const data = ages.map((age) => ({
    age,
    total: getTotalBalance(result, age),
  }));

  const finalBalance = data[data.length - 1]?.total ?? 0;

  return (
    <section
      aria-label={label}
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-5 shadow-sm transition-colors",
        highlight ? "border-accent ring-1 ring-accent/30" : "border-border",
      )}
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold text-[12px] text-muted-foreground uppercase tracking-[0.1em]">
          {highlight ? "Your what-if plan" : "Your baseline"}
        </p>
        {highlight ? (
          <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
        ) : null}
      </div>
      <p className="font-semibold text-[14px] text-foreground">{label}</p>
      <div
        role="img"
        aria-label={`${label} bar chart of total CPF balance per age`}
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border)"
            />
            <XAxis
              dataKey="age"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              tickFormatter={compactCurrency}
            />
            <Tooltip
              cursor={{ fill: "var(--color-muted)" }}
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => formatCurrency(Number(value), 0)}
              labelFormatter={(value) => `Age ${value}`}
            />
            <Bar
              dataKey="total"
              fill={
                highlight
                  ? "var(--color-chart-2)"
                  : "var(--color-muted-foreground)"
              }
              radius={[4, 4, 0, 0]}
              opacity={highlight ? 1 : 0.6}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
        <span className="text-[11px] text-muted-foreground">
          At age {result.yearlyBalances[result.yearlyBalances.length - 1]?.age}
        </span>
        <span className="font-bold font-mono text-[18px] text-foreground">
          {formatCurrency(finalBalance, 0)}
        </span>
      </div>
    </section>
  );
}

export default function ScenarioComparisonChart({
  baseline,
  scenario,
  baselineLabel,
  scenarioLabel,
}: ScenarioComparisonChartProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <ChartPanel label={baselineLabel} result={baseline} />
      <ChartPanel label={scenarioLabel} result={scenario} highlight />
    </div>
  );
}
