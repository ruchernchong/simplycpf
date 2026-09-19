"use client";

import { Card } from "@heroui/react";
import { AreaChart } from "@heroui-pro/react/area-chart";
import { Legend } from "recharts";
import { formatCurrency } from "@/lib/format";
import type { ProjectionResult } from "@/types";

interface BalanceGrowthChartProps {
  yearlyBalances: ProjectionResult["yearlyBalances"];
}

const accountSeries = [
  { key: "oa", name: "OA", color: "var(--chart-1)" },
  { key: "sa", name: "SA", color: "var(--chart-2)" },
  { key: "ma", name: "MA", color: "var(--chart-3)" },
  { key: "ra", name: "RA", color: "var(--chart-4)" },
] as const;

export default function BalanceGrowthChart({
  yearlyBalances,
}: BalanceGrowthChartProps) {
  const chartData = yearlyBalances.map(({ age, balances }) => ({
    age,
    oa: Math.round(balances.oa),
    sa: Math.round(balances.sa),
    ma: Math.round(balances.ma),
    ra: Math.round(balances.ra),
  }));

  return (
    <Card>
      <Card.Header>
        <Card.Title>Balance Growth Over Time</Card.Title>
      </Card.Header>
      <Card.Content>
        <div
          role="img"
          aria-label="Stacked area chart showing projected CPF balances across OA, SA, MA and RA by age"
        >
          <AreaChart data={chartData} height={360}>
            <AreaChart.Grid strokeDasharray="3 3" vertical={false} />
            <AreaChart.XAxis dataKey="age" />
            <AreaChart.YAxis
              tickFormatter={(value) => formatCurrency(value, 0)}
            />
            <AreaChart.Tooltip
              content={
                <AreaChart.TooltipContent
                  labelFormatter={(value) => `Age ${value}`}
                  valueFormatter={(value) => formatCurrency(Number(value), 0)}
                />
              }
            />
            <Legend />
            {accountSeries.map((series) => (
              <AreaChart.Area
                key={series.key}
                dataKey={series.key}
                name={series.name}
                stackId="cpf"
                stroke={series.color}
                fill={series.color}
                fillOpacity={0.7}
              />
            ))}
          </AreaChart>
        </div>
      </Card.Content>
    </Card>
  );
}
