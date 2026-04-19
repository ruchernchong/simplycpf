"use client";

import { format, parse } from "date-fns";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CPF_INTEREST_FLOOR_RATES,
  SGS_YIELDS_MONTHLY,
} from "@/constants/cpf-interest-rates";
import { calculateInterestTrend } from "@/lib/calculate-interest-trend";
import { formatPercentage } from "@/lib/format";

const COLORS = {
  sgsYield: "var(--color-chart-1)",
  peggedRate: "var(--color-chart-4)",
  actualRate: "var(--color-chart-2)",
  floorLine: "var(--color-destructive)",
};

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-card p-3 shadow-sm">
      <p className="pb-1 font-medium text-[12px] text-foreground">{label}</p>
      {payload.map((entry) => (
        <p
          key={entry.name}
          className="text-[11px]"
          style={{ color: entry.color }}
        >
          {entry.name}:{" "}
          {formatPercentage(entry.value / 100, { decimalPlaces: 2 })}
        </p>
      ))}
    </div>
  );
}

export function InterestRateTrendChart() {
  const trendData = calculateInterestTrend(SGS_YIELDS_MONTHLY);

  const chartData = trendData.map((data) => ({
    month: format(parse(data.month, "yyyy-MM", new Date()), "MMM yy"),
    "10Y SGS Yield": data.sgsYield,
    "Pegged Rate (SGS+1%)": data.peggedRate,
    "Actual SMRA Rate": data.actualRate,
  }));

  return (
    <section
      aria-label="Interest rate trend"
      className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-[16px] text-foreground">
          Interest Rate Trend (12-Month View)
        </h2>
        <p className="text-[12px] text-muted-foreground">
          The SMRA actual rate is the higher of the pegged rate (SGS yield + 1%)
          and the 4% floor.
        </p>
      </div>
      <div role="img" aria-label="Line chart of CPF interest rate trends">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border)"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              tickFormatter={(value) =>
                formatPercentage(value / 100, { decimalPlaces: 1 })
              }
              domain={[2, 5]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              iconType="circle"
              iconSize={8}
            />
            <ReferenceLine
              y={CPF_INTEREST_FLOOR_RATES.SMRA}
              stroke={COLORS.floorLine}
              strokeDasharray="5 5"
              strokeWidth={1.5}
              label={{
                value: "SMRA Floor (4%)",
                position: "right",
                fill: COLORS.floorLine,
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="10Y SGS Yield"
              stroke={COLORS.sgsYield}
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Pegged Rate (SGS+1%)"
              stroke={COLORS.peggedRate}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Actual SMRA Rate"
              stroke={COLORS.actualRate}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-3">
        <div className="rounded-md bg-muted/50 p-4 ring-1 ring-border/60">
          <p className="text-[12px] text-muted-foreground leading-[1.55]">
            <span className="font-semibold text-foreground">How it works:</span>{" "}
            The SMRA (Special, MediSave & Retirement Accounts) interest rate is
            pegged to the 12-month average of 10-year Singapore Government
            Securities (SGS) yield plus 1%. When this pegged rate falls below
            4%, members receive the floor rate of 4% instead.
          </p>
        </div>
        <div className="rounded-md bg-accent/5 p-4 ring-1 ring-accent/20">
          <p className="text-[12px] text-muted-foreground leading-[1.55]">
            <span className="font-semibold text-accent">
              Why floor rates matter:
            </span>{" "}
            Floor rates protect your CPF savings during periods of low interest
            rates. Even when market rates fall below the floor, your CPF
            accounts continue to earn the guaranteed minimum rate, ensuring
            consistent growth of your retirement savings.
          </p>
        </div>
      </div>
    </section>
  );
}

export default InterestRateTrendChart;
