"use client";

import { Card, Chip, cn, Separator } from "@heroui/react";
import { Fragment } from "react";
import { SplitBar } from "@/components/shared/split-bar";
import { formatCurrency } from "@/lib/format";
import type { CalculatorFigures } from "./figures";
import { formatRate } from "./figures";

interface DistributionCardProps {
  figures: CalculatorFigures;
}

export function DistributionCard({ figures }: DistributionCardProps) {
  const specialAccountName = figures.isRetirementAccount
    ? "Retirement Account"
    : "Special Account";

  const accounts = [
    {
      name: "Ordinary Account",
      swatch: "bg-chart-1",
      amount: figures.oa,
      body: "Housing, mortgage, insurance, education. 2.50% a year. Anything used for a home accrues interest until you sell.",
    },
    {
      name: specialAccountName,
      swatch: "bg-chart-2",
      amount: figures.sa,
      body: figures.isRetirementAccount
        ? "Your Special Account closed at 55, so this share now goes to the Retirement Account. 4.00% a year, and it funds your CPF LIFE payouts."
        : "Retirement savings, 4.00% a year plus extra interest on the first $60,000 combined. Closes on your 55th birthday, when savings move to a Retirement Account.",
    },
    {
      name: "MediSave Account",
      swatch: "bg-chart-3",
      amount: figures.ma,
      body: "Hospital bills and approved insurance. 4.00% a year, capped at the Basic Healthcare Sum; anything above it overflows.",
    },
  ];

  return (
    <Card className="gap-6 p-6">
      <Card.Header className="flex-row flex-wrap items-baseline justify-between gap-2">
        <Card.Title className="font-semibold text-base tracking-tight">
          How {formatCurrency(figures.total)} is distributed
        </Card.Title>
        <Chip size="sm" variant="tertiary">
          Allocation rates for {figures.ageGroup.description}
        </Chip>
      </Card.Header>

      <Card.Content className="gap-6">
        <SplitBar
          segments={[
            {
              label: `Ordinary ${formatRate(figures.oaRate)}`,
              value: figures.oa,
              color: "chart-1",
            },
            {
              label: `${figures.isRetirementAccount ? "Retirement" : "Special"} ${formatRate(figures.saRate)}`,
              value: figures.sa,
              color: "chart-2",
            },
            {
              label: `MediSave ${formatRate(figures.maRate)}`,
              value: figures.ma,
              color: "chart-3",
            },
          ]}
          size="md"
        />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch">
          {accounts.map((account, index) => (
            <Fragment key={account.name}>
              {index > 0 && (
                <Separator className="hidden sm:block" orientation="vertical" />
              )}
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={cn("size-2 rounded-[2px]", account.swatch)}
                  />
                  <span className="font-semibold text-sm">{account.name}</span>
                </div>
                <span className="font-semibold text-[23px] tracking-tight">
                  {formatCurrency(account.amount)}
                </span>
                <p className="text-[12.5px] text-muted leading-relaxed">
                  {account.body}
                </p>
              </div>
            </Fragment>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}
