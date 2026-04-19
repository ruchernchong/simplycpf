"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import type { ProjectionResult } from "@/types";

interface BalanceGrowthChartProps {
  yearlyBalances: ProjectionResult["yearlyBalances"];
}

const accountColours = {
  oa: "var(--color-chart-1)",
  smra: "var(--color-chart-2)",
  ma: "var(--color-chart-3)",
} as const;

function compactCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${Math.round(value / 1_000)}k`;
  }
  return `$${value}`;
}

export default function BalanceGrowthChart({
  yearlyBalances,
}: BalanceGrowthChartProps) {
  const chartData = yearlyBalances.map(({ age, balances }) => ({
    age,
    oa: Math.round(balances.oa),
    smra: Math.round(balances.sa + balances.ra),
    ma: Math.round(balances.ma),
  }));

  return (
    <section
      aria-labelledby="balance-growth-chart-heading"
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <h3
          id="balance-growth-chart-heading"
          className="font-semibold text-[16px] text-foreground"
        >
          Your Projected CPF Balances
        </h3>
        <p className="text-[12px] text-muted-foreground">
          From your current age to target age — OA + SA/RA + MA stacked
        </p>
      </div>
      <div
        role="img"
        aria-label="Stacked bar chart showing projected CPF balances across OA, SA/RA, and MA by age"
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border)"
            />
            <XAxis
              dataKey="age"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
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
              formatter={(value, name) => [
                formatCurrency(Number(value), 0),
                name,
              ]}
              labelFormatter={(value) => `Age ${value}`}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            />
            <Bar
              dataKey="oa"
              name="OA"
              stackId="cpf"
              fill={accountColours.oa}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="smra"
              name="SA / RA"
              stackId="cpf"
              fill={accountColours.smra}
            />
            <Bar
              dataKey="ma"
              name="MA"
              stackId="cpf"
              fill={accountColours.ma}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
