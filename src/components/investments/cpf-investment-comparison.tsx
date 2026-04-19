"use client";

import posthog from "posthog-js";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface InvestmentScenario {
  key: string;
  name: string;
  rate: number;
  caption: string;
  highlight?: boolean;
  color: string;
}

const SCENARIOS: InvestmentScenario[] = [
  {
    key: "cpf",
    name: "CPF OA",
    rate: CPF_INTEREST_FLOOR_RATES.OA,
    caption: "2.5% p.a. guaranteed",
    color: "var(--color-chart-3)",
  },
  {
    key: "bonds",
    name: "SGS Bonds",
    rate: 3.5,
    caption: "~3.5% p.a. historical",
    color: "var(--color-chart-4)",
  },
  {
    key: "sti",
    name: "STI ETF",
    rate: 6.0,
    caption: "~6.0% p.a. historical",
    color: "var(--color-chart-1)",
  },
  {
    key: "global",
    name: "Global ETF",
    rate: 7.5,
    caption: "~7.5% p.a. historical",
    highlight: true,
    color: "var(--color-chart-2)",
  },
];

const SAMPLE_YEARS = [5, 10, 15, 20];

interface ChartRow {
  label: string;
  cpf: number;
  bonds: number;
  sti: number;
  global: number;
}

function futureValue(
  principal: number,
  monthly: number,
  ratePct: number,
  years: number,
): number {
  const annual = ratePct / 100;
  const lumpsum = principal * (1 + annual) ** years;
  if (monthly <= 0) return lumpsum;
  const monthlyRate = annual / 12;
  const months = years * 12;
  const annuity =
    monthlyRate === 0
      ? monthly * months
      : monthly * (((1 + monthlyRate) ** months - 1) / monthlyRate);
  return lumpsum + annuity;
}

function compactCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000)
    return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return `$${Math.round(value)}`;
}

function parseNumeric(value: string): number {
  return Number.parseFloat(value) || 0;
}

export function CPFInvestmentComparison() {
  const [principal, setPrincipal] = useState(50_000);
  const [years, setYears] = useState(20);
  const [monthly, setMonthly] = useState(500);

  const captureChange = (field: string, value: number) => {
    posthog.capture("investment_input_changed", { field, value });
  };

  const chartData: ChartRow[] = SAMPLE_YEARS.filter((y) => y <= years).map(
    (year) => ({
      label: `Year ${year}`,
      cpf: futureValue(principal, monthly, SCENARIOS[0].rate, year),
      bonds: futureValue(principal, monthly, SCENARIOS[1].rate, year),
      sti: futureValue(principal, monthly, SCENARIOS[2].rate, year),
      global: futureValue(principal, monthly, SCENARIOS[3].rate, year),
    }),
  );

  const finalValues = SCENARIOS.map((scenario) => ({
    ...scenario,
    finalValue: futureValue(principal, monthly, scenario.rate, years),
  }));

  return (
    <div className="flex flex-col gap-5">
      <section
        aria-label="Investment inputs"
        className="grid gap-4 rounded-lg border border-border bg-card p-6 shadow-sm sm:grid-cols-3"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="investment-principal">Initial Amount</Label>
          <Input
            id="investment-principal"
            type="number"
            min={0}
            step={1000}
            value={principal}
            onChange={(event) => {
              const next = parseNumeric(event.target.value);
              setPrincipal(next);
              captureChange("principal", next);
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="investment-years">Investment Period</Label>
          <Input
            id="investment-years"
            type="number"
            min={1}
            max={40}
            value={years}
            onChange={(event) => {
              const next = Math.min(
                40,
                Math.max(1, parseNumeric(event.target.value)),
              );
              setYears(next);
              captureChange("years", next);
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="investment-topup">Monthly Top-up</Label>
          <Input
            id="investment-topup"
            type="number"
            min={0}
            step={50}
            value={monthly}
            onChange={(event) => {
              const next = parseNumeric(event.target.value);
              setMonthly(next);
              captureChange("monthly", next);
            }}
          />
        </div>
      </section>

      <section
        aria-label="Growth comparison chart"
        className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <h2 className="font-semibold text-[16px] text-foreground">
          Growth Comparison
        </h2>
        <div role="img" aria-label="Bar chart comparing investment growth">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="label"
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
                formatter={(value, name) => [
                  formatCurrency(Number(value), 0),
                  name,
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                iconType="circle"
                iconSize={8}
              />
              {SCENARIOS.map((scenario) => (
                <Bar
                  key={scenario.key}
                  dataKey={scenario.key}
                  name={scenario.name}
                  fill={scenario.color}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section
        aria-label="Final values"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {finalValues.map((scenario) => {
          const tone = scenario.highlight
            ? "border-accent bg-accent text-accent-foreground"
            : "border-border bg-card text-foreground";
          const captionTone = scenario.highlight
            ? "text-accent-foreground/80"
            : "text-muted-foreground";
          return (
            <div
              key={scenario.key}
              className={cn(
                "flex flex-col gap-1 rounded-lg border p-4 shadow-sm",
                tone,
              )}
            >
              <p
                className={cn(
                  "font-semibold text-[10px] uppercase tracking-[0.1em]",
                  captionTone,
                )}
              >
                {scenario.name}
              </p>
              <p className="font-bold font-mono text-[20px]">
                {formatCurrency(scenario.finalValue, 0)}
              </p>
              <p className={cn("text-[11px]", captionTone)}>
                {scenario.caption}
              </p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
