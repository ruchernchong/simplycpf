"use client";

import { Card, Chip, cn, Separator, Typography } from "@heroui/react";
import { Fragment } from "react";
import { SplitBar } from "@/components/shared/split-bar";
import { formatCurrency } from "@/lib/format";
import { CPF_POLICY_CATALOGUE } from "@/policy";
import type { CalculatorFigures } from "./figures";
import { formatRate } from "./figures";

interface DistributionCardProps {
  figures: CalculatorFigures;
}

export function DistributionCard({ figures }: DistributionCardProps) {
  const methodology = CPF_POLICY_CATALOGUE.interestRateMethodology;
  const extraInterest = CPF_POLICY_CATALOGUE.rules.extraInterest;
  const retirementAge =
    CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;
  const specialAccountName = figures.isRetirementAccount
    ? "Retirement Account"
    : "Special Account";

  const accounts = [
    {
      name: "Ordinary Account",
      swatch: "bg-chart-1",
      amount: figures.oa,
      body: `Approved housing, insurance, investment and education uses. The published floor is ${methodology.ordinaryAccount.floorRate.toFixed(2)}% a year; housing refunds include accrued interest.`,
    },
    {
      name: specialAccountName,
      swatch: "bg-chart-2",
      amount: figures.sa,
      body: figures.isRetirementAccount
        ? `After the SA closure from age ${retirementAge}, this retirement share goes to RA. The published floor is ${methodology.specialMediSaveRetirementAccounts.floorRate.toFixed(2)}% a year.`
        : `Retirement savings at a published floor of ${methodology.specialMediSaveRetirementAccounts.floorRate.toFixed(2)}% a year, plus extra interest on the first ${formatCurrency(extraInterest.below55.balanceCap, 0)} of combined balances. SA closes from age ${retirementAge}.`,
    },
    {
      name: "MediSave Account",
      swatch: "bg-chart-3",
      amount: figures.ma,
      body: `Healthcare expenses and approved insurance at a published floor of ${methodology.specialMediSaveRetirementAccounts.floorRate.toFixed(2)}% a year. Contributions above the applicable BHS route to SA or RA up to the retirement-sum limit, then OA.`,
    },
  ];

  return (
    <Card className="gap-6 p-6">
      <Card.Header className="flex-row flex-wrap items-baseline justify-between gap-2">
        <Card.Title>
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
                    className={cn("size-2 rounded-xs", account.swatch)}
                  />
                  <Typography type="body-sm" weight="semibold">
                    {account.name}
                  </Typography>
                </div>
                <Typography type="h3">
                  {formatCurrency(account.amount)}
                </Typography>
                <Typography color="muted" type="body-sm">
                  {account.body}
                </Typography>
              </div>
            </Fragment>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}
