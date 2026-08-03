"use client";

import { Card } from "@heroui/react";
import {
  Area,
  AreaChart,
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
  oa: "#2563eb",
  sa: "#0f766e",
  ma: "#f59e0b",
  ra: "#7c3aed",
} as const;

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
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="age" />
              <YAxis tickFormatter={(value) => formatCurrency(value, 0)} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value), 0)}
                labelFormatter={(value) => `Age ${value}`}
              />
              <Legend />
              <Area
                dataKey="oa"
                name="OA"
                stackId="cpf"
                stroke={accountColours.oa}
                fill={accountColours.oa}
                fillOpacity={0.7}
              />
              <Area
                dataKey="sa"
                name="SA"
                stackId="cpf"
                stroke={accountColours.sa}
                fill={accountColours.sa}
                fillOpacity={0.7}
              />
              <Area
                dataKey="ma"
                name="MA"
                stackId="cpf"
                stroke={accountColours.ma}
                fill={accountColours.ma}
                fillOpacity={0.7}
              />
              <Area
                dataKey="ra"
                name="RA"
                stackId="cpf"
                stroke={accountColours.ra}
                fill={accountColours.ra}
                fillOpacity={0.7}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card.Content>
    </Card>
  );
}
