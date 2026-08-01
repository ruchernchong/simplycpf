"use client";

import {
  Card,
  Chip,
  Label,
  Link,
  NumberField,
  Separator,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@heroui/react";
import { BarChart } from "@heroui-pro/react";
import { parseAsInteger, useQueryStates } from "nuqs";
import type { Key } from "react";
import { Cell } from "recharts";
import { SplitBar } from "@/components/shared/split-bar";
import { calculateAccruedInterest } from "@/lib/calculate-accrued-interest";
import { formatCurrency, formatPercentage } from "@/lib/format";

const AMOUNT_OPTIONS = [150_000, 250_000, 400_000] as const;
const YEAR_OPTIONS = [5, 10, 20] as const;

const searchParams = {
  amount: parseAsInteger.withDefault(250_000),
  loan: parseAsInteger.withDefault(200_000),
  sale: parseAsInteger.withDefault(650_000),
  years: parseAsInteger.withDefault(10),
};

const NOT_MODELLED = [
  "Monthly instalments paid from OA after the lump sum; each withdrawal has its own accrued-interest clock.",
  "Agent fees, legal costs, stamp duty, option money, or other transaction adjustments.",
  "Valuation and withdrawal limits, which cap how much OA you may use.",
  "Property pledges, co-owner apportionment, and the special pre-2013 refund exception.",
];

function firstKey(keys: Set<Key>): string | undefined {
  const [key] = [...keys];
  return key === undefined ? undefined : String(key);
}

export function AccruedInterestContent() {
  const [{ amount, loan, sale, years }, setQuery] = useQueryStates(
    searchParams,
    {
      history: "replace",
    },
  );

  const hAmount = AMOUNT_OPTIONS.some((option) => option === amount)
    ? amount
    : 250_000;
  const hYears = YEAR_OPTIONS.some((option) => option === years) ? years : 10;
  const hSale = Math.max(0, sale);
  const hLoan = Math.max(0, loan);

  const result = calculateAccruedInterest({
    oaUsed: hAmount,
    yearsHeld: hYears,
    marketValueSalePrice: hSale,
    outstandingHousingLoan: hLoan,
  });
  const uplift =
    result.principal === 0
      ? 0
      : (result.accruedInterest / result.principal) * 100;
  const annualRateLabel = formatPercentage(result.annualRate, {
    decimalPlaces: 2,
  });

  const chartData = result.yearlyRows.map((row) => ({
    year: String(row.year),
    interest: Math.round(row.cumulativeInterest),
  }));

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Card>
        <Card.Header>
          <Card.Title>Your situation</Card.Title>
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

          <NumberField
            fullWidth
            formatOptions={{
              currency: "SGD",
              currencyDisplay: "narrowSymbol",
              maximumFractionDigits: 0,
              style: "currency",
            }}
            minValue={0}
            name="market-value-sale-price"
            step={10_000}
            value={hSale}
            variant="secondary"
            onChange={(value) =>
              setQuery({ sale: Number.isNaN(value) ? 0 : value })
            }
          >
            <Label>Expected market-value sale price</Label>
            <NumberField.Group className="grid-cols-1">
              <NumberField.Input />
            </NumberField.Group>
          </NumberField>

          <NumberField
            fullWidth
            formatOptions={{
              currency: "SGD",
              currencyDisplay: "narrowSymbol",
              maximumFractionDigits: 0,
              style: "currency",
            }}
            minValue={0}
            name="outstanding-housing-loan"
            step={10_000}
            value={hLoan}
            variant="secondary"
            onChange={(value) =>
              setQuery({ loan: Number.isNaN(value) ? 0 : value })
            }
          >
            <Label>Outstanding housing loan at sale</Label>
            <NumberField.Group className="grid-cols-1">
              <NumberField.Input />
            </NumberField.Group>
          </NumberField>

          <Card variant="tertiary">
            <Card.Content>
              <Typography type="body-sm">
                This SimplyCPF illustration holds the current OA floor rate of
                <strong> {annualRateLabel}</strong> constant and treats the OA
                amount as one lump-sum withdrawal held for whole years.
              </Typography>
            </Card.Content>
          </Card>
        </Card.Content>
      </Card>

      <div className="flex flex-col gap-8">
        <Card>
          <Card.Header>
            <Card.Title>The short answer</Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-6">
            <Typography className="max-w-[64ch]">
              Take {formatCurrency(result.principal, 0)} out of your OA for a
              home and hold it {result.yearsHeld} years:{" "}
              {formatCurrency(result.accruedInterest, 0)} of accrued interest
              builds up alongside it. The required refund becomes{" "}
              {formatCurrency(result.requiredRefund, 0)}, {uplift.toFixed(1)}%
              more than you took out. From net sale proceeds of{" "}
              {formatCurrency(result.netSaleProceeds, 0)}, this illustration
              refunds {formatCurrency(result.refundToCpf, 0)} to CPF and leaves{" "}
              {formatCurrency(result.cashProceeds, 0)} in cash.
            </Typography>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card variant="tertiary">
                <Card.Content className="flex flex-col gap-2">
                  <Typography color="muted" type="body-xs">
                    OA used
                  </Typography>
                  <Typography type="h3">
                    {formatCurrency(result.principal, 0)}
                  </Typography>
                </Card.Content>
              </Card>
              <Card variant="tertiary">
                <Card.Content className="flex flex-col gap-2">
                  <Typography color="muted" type="body-xs">
                    Accrued interest
                  </Typography>
                  <Typography type="h3">
                    {formatCurrency(result.accruedInterest, 0)}
                  </Typography>
                </Card.Content>
              </Card>
              <Card className="border-accent/25 bg-accent/10">
                <Card.Content className="flex flex-col gap-2">
                  <Typography color="muted" type="body-xs">
                    Required refund
                  </Typography>
                  <Typography className="text-accent" type="h3">
                    {formatCurrency(result.requiredRefund, 0)}
                  </Typography>
                </Card.Content>
              </Card>
              <Card variant="tertiary">
                <Card.Content className="flex flex-col gap-2">
                  <Typography color="muted" type="body-xs">
                    Net sale proceeds
                  </Typography>
                  <Typography type="h3">
                    {formatCurrency(result.netSaleProceeds, 0)}
                  </Typography>
                </Card.Content>
              </Card>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header className="flex-row flex-wrap items-center justify-between gap-2">
            <Card.Title>How the tab grows, year by year</Card.Title>
            <Chip size="sm" variant="soft">
              Principal held flat · interest compounding at {annualRateLabel}
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
            <div className="flex items-baseline justify-between gap-4">
              <Typography color="muted" type="body-xs">
                Year 1
              </Typography>
              <Typography color="muted" type="body-xs">
                Interest accrued each year, cumulative
              </Typography>
              <Typography color="muted" type="body-xs">
                {`Year ${result.yearsHeld}`}
              </Typography>
            </div>
          </Card.Content>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <Card.Header>
              <Card.Title>Where the sale money goes first</Card.Title>
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
              <div className="flex items-baseline justify-between gap-4">
                <Typography color="muted" type="body-xs">
                  {`${formatCurrency(result.refundToCpf, 0)} refunded`}
                </Typography>
                <Typography color="muted" type="body-xs">
                  {`${formatCurrency(result.cashProceeds, 0)} in hand`}
                </Typography>
              </div>
              <Typography type="body-sm">
                Selling price {formatCurrency(result.marketValueSalePrice, 0)}
                {" minus "}
                {formatCurrency(result.outstandingHousingLoan, 0)} outstanding
                loan gives {formatCurrency(result.netSaleProceeds, 0)} of net
                sale proceeds before the CPF refund.
              </Typography>
              {result.refundShortfall > 0 && (
                <Typography color="muted" type="body-sm">
                  The {formatCurrency(result.refundShortfall, 0)} shortfall does
                  not need a cash top-up if the property is sold at market
                  value. CPF Board determines the actual refund for your sale.
                </Typography>
              )}
              <Link
                href="https://www.cpf.gov.sg/member/home-ownership/using-your-cpf-to-buy-a-home/cpf-refund-when-selling-or-transferring-property"
                rel="noopener noreferrer"
                target="_blank"
              >
                CPF Board: refunds when selling a property
                <Link.Icon aria-hidden="true" />
              </Link>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>What this does not model</Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <ol className="flex flex-col gap-4">
                {NOT_MODELLED.map((item, index) => (
                  <li className="flex gap-4" key={item}>
                    <Typography color="muted" type="body-xs">
                      {String(index + 1).padStart(2, "0")}
                    </Typography>
                    <Typography type="body-sm">{item}</Typography>
                  </li>
                ))}
              </ol>
              <Separator />
              <Typography color="muted" type="body-xs">
                A SimplyCPF illustration of one lump-sum OA withdrawal, not a
                property valuation, CPF statement, or advice.
              </Typography>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AccruedInterestContent;
