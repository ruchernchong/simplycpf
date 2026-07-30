"use client";

import {
  Card,
  Chip,
  Label,
  Separator,
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react";
import { BarChart } from "@heroui-pro/react";
import { parseAsInteger, useQueryStates } from "nuqs";
import type { Key } from "react";
import { Cell } from "recharts";
import { SplitBar } from "@/components/shared/split-bar";
import { calculateAccruedInterest } from "@/lib/calculate-accrued-interest";
import { formatCurrency } from "@/lib/format";

const AMOUNT_OPTIONS = [150_000, 250_000, 400_000] as const;
const YEAR_OPTIONS = [5, 10, 20] as const;

const searchParams = {
  amount: parseAsInteger.withDefault(250_000),
  years: parseAsInteger.withDefault(10),
};

const NOT_MODELLED = [
  "Monthly instalments paid from OA after the down payment — each one adds to the tab.",
  "Property appreciation, agent fees, stamp duty, or outstanding loan.",
  "Valuation and withdrawal limits, which cap how much OA you may use.",
  "The rules that apply after 55, when a retirement sum must be set aside.",
];

function firstKey(keys: Set<Key>): string | undefined {
  const [key] = [...keys];
  return key === undefined ? undefined : String(key);
}

export function AccruedInterestContent() {
  const [{ amount, years }, setQuery] = useQueryStates(searchParams, {
    history: "replace",
  });

  const hAmount = AMOUNT_OPTIONS.some((option) => option === amount)
    ? amount
    : 250_000;
  const hYears = YEAR_OPTIONS.some((option) => option === years) ? years : 10;

  const result = calculateAccruedInterest(hAmount, hYears);
  const uplift = (result.accruedInterest / result.principal) * 100;

  const chartData = result.yearlyRows.map((row) => ({
    year: String(row.year),
    interest: Math.round(row.cumulativeInterest),
  }));

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Card>
        <Card.Header>
          <Card.Title className="font-semibold text-base tracking-tight">
            Your situation
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label>OA used for the property</Label>
            <ToggleButtonGroup
              aria-label="OA used for the property"
              disallowEmptySelection
              fullWidth
              selectedKeys={[String(hAmount)]}
              selectionMode="single"
              size="sm"
              onSelectionChange={(keys) => {
                const key = firstKey(keys);
                if (key) setQuery({ amount: Number(key) });
              }}
            >
              {AMOUNT_OPTIONS.map((option) => (
                <ToggleButton id={String(option)} key={option}>
                  {`$${option / 1000}k`}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Years held before selling</Label>
            <ToggleButtonGroup
              aria-label="Years held before selling"
              disallowEmptySelection
              fullWidth
              selectedKeys={[String(hYears)]}
              selectionMode="single"
              size="sm"
              onSelectionChange={(keys) => {
                const key = firstKey(keys);
                if (key) setQuery({ years: Number(key) });
              }}
            >
              {YEAR_OPTIONS.map((option) => (
                <ToggleButton id={String(option)} key={option}>
                  {`${option} yrs`}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>

          <Card variant="tertiary">
            <Card.Content className="text-[12.5px] leading-relaxed">
              Accrued interest compounds at <strong>2.50%</strong> a year — the
              OA floor rate — on the amount withdrawn, from the month it is
              withdrawn.
            </Card.Content>
          </Card>
        </Card.Content>
      </Card>

      <div className="flex flex-col gap-8">
        <Card>
          <Card.Header>
            <Card.Title className="font-semibold text-base tracking-tight">
              The short answer
            </Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-6">
            <p className="max-w-[64ch] text-[19px] leading-relaxed">
              Take {formatCurrency(result.principal, 0)} out of your OA for a
              home and hold it {result.yearsHeld} years:{" "}
              {formatCurrency(result.accruedInterest, 0)} of accrued interest
              builds up alongside it. On sale,{" "}
              {formatCurrency(result.totalOwed, 0)} goes back into your CPF
              before any cash reaches you — that is {uplift.toFixed(1)}% more
              than you took out.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card variant="tertiary">
                <Card.Content className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-muted uppercase tracking-[0.12em]">
                    OA used
                  </span>
                  <span className="font-semibold text-2xl tracking-tight">
                    {formatCurrency(result.principal, 0)}
                  </span>
                </Card.Content>
              </Card>
              <Card variant="tertiary">
                <Card.Content className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-muted uppercase tracking-[0.12em]">
                    Accrued interest
                  </span>
                  <span className="font-semibold text-2xl tracking-tight">
                    {formatCurrency(result.accruedInterest, 0)}
                  </span>
                </Card.Content>
              </Card>
              <Card className="border-accent/25 bg-accent/10">
                <Card.Content className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-muted uppercase tracking-[0.12em]">
                    Refundable on sale
                  </span>
                  <span className="font-semibold text-2xl text-accent tracking-tight">
                    {formatCurrency(result.totalOwed, 0)}
                  </span>
                </Card.Content>
              </Card>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header className="flex-row flex-wrap items-center justify-between gap-2">
            <Card.Title className="font-semibold text-base tracking-tight">
              How the tab grows, year by year
            </Card.Title>
            <Chip size="sm" variant="soft">
              Principal held flat · interest compounding at 2.50%
            </Chip>
          </Card.Header>
          <Card.Content className="flex flex-col gap-2">
            <BarChart data={chartData} height={200}>
              <BarChart.XAxis dataKey="year" hide />
              <BarChart.YAxis hide />
              <BarChart.Bar
                dataKey="interest"
                fill="var(--chart-3)"
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    fill={
                      index === chartData.length - 1
                        ? "var(--chart-1)"
                        : "var(--chart-3)"
                    }
                    key={entry.year}
                  />
                ))}
              </BarChart.Bar>
            </BarChart>
            <Separator />
            <div className="flex items-baseline justify-between gap-4 font-mono text-[11px] text-muted">
              <span>Year 1</span>
              <span>Interest accrued each year, cumulative</span>
              <span>{`Year ${result.yearsHeld}`}</span>
            </div>
          </Card.Content>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <Card.Header>
              <Card.Title className="font-semibold text-base tracking-tight">
                Where the sale money goes first
              </Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <SplitBar
                formatValue={(value) => formatCurrency(value, 0)}
                segments={[
                  {
                    label: "Back to CPF",
                    value: result.refundToCpf,
                    color: "chart-1",
                  },
                  {
                    label: "Cash to you",
                    value: result.cashProceeds,
                    color: "track",
                  },
                ]}
                size="md"
              />
              <div className="flex items-baseline justify-between gap-4 text-muted text-xs">
                <span>{`${formatCurrency(result.refundToCpf, 0)} refunded`}</span>
                <span>{`${formatCurrency(result.cashProceeds, 0)} in hand`}</span>
              </div>
              <p className="text-[12.5px] leading-relaxed">
                Illustrated against a sale price of{" "}
                {formatCurrency(result.illustrativeSalePrice, 0)} with the
                mortgage settled. The refund restores your retirement sum and
                resumes earning CPF interest.
              </p>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title className="font-semibold text-base tracking-tight">
                What this does not model
              </Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <ol className="flex flex-col gap-3">
                {NOT_MODELLED.map((item, index) => (
                  <li className="flex gap-3" key={item}>
                    <span className="font-mono text-[10.5px] text-muted tracking-[0.12em]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[12.5px] leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
              <Separator />
              <p className="text-muted text-xs">
                An illustration of one mechanism, not a valuation and not
                advice.
              </p>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AccruedInterestContent;
