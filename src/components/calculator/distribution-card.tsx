"use client";

import { Card, Chip, cn, Separator, Surface, Typography } from "@heroui/react";
import { Fragment, type ReactElement } from "react";
import type { SplitBarColor } from "@/components/shared/split-bar";
import { SplitBar } from "@/components/shared/split-bar";
import { formatCurrency } from "@/lib/format";
import type { ContributionAllocationBranch } from "@/policy";
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

  if (figures.routing?.selected === "undetermined") {
    const branches = [
      {
        key: "before-frs",
        title: "Before the Full Retirement Sum is set aside",
        body: `The ${formatRate(figures.retirementRate)} retirement allocation goes to RA.`,
        distribution: figures.routing.branches.beforeFullRetirementSum,
      },
      {
        key: "after-frs",
        title: "After the Full Retirement Sum is set aside",
        body: `The same ${formatRate(figures.retirementRate)} retirement allocation goes to OA instead.`,
        distribution: figures.routing.branches.afterFullRetirementSum,
      },
    ] as const;

    return (
      <Card className="gap-6 p-6">
        <Card.Header className="flex-row flex-wrap items-baseline justify-between gap-2">
          <Card.Title>Where {formatCurrency(figures.total)} can go</Card.Title>
          <Chip size="sm" variant="tertiary">
            Allocation rates for {figures.ageGroup.description}
          </Chip>
        </Card.Header>

        <Card.Content className="gap-6">
          <Typography className="max-w-[72ch]" color="muted" type="body-sm">
            CPF Board routes the retirement share to RA until the applicable
            Full Retirement Sum is set aside, then to OA. Your account context
            was not supplied, so both official outcomes are shown.
          </Typography>

          <div className="grid gap-4 lg:grid-cols-2">
            {branches.map((branch) => (
              <RoutingBranchCard
                body={branch.body}
                distribution={branch.distribution}
                key={branch.key}
                title={branch.title}
                total={figures.total}
              />
            ))}
          </div>

          <Typography color="muted" type="body-xs">
            Published allocation shares: base OA {formatRate(figures.oaRate)} ·
            retirement {formatRate(figures.retirementRate)} · MA{" "}
            {formatRate(figures.maRate)}. The destination of the retirement
            share is the only difference between the branches above.
          </Typography>
        </Card.Content>
      </Card>
    );
  }

  const selectedDistribution = figures.selectedDistribution;
  if (!selectedDistribution) return null;

  const accounts = [
    {
      name: "Ordinary Account",
      swatch: "bg-chart-1",
      amount: selectedDistribution.oa,
      body: `Approved housing, insurance, investment and education uses. The published floor is ${methodology.ordinaryAccount.floorRate.toFixed(2)}% a year; housing refunds include accrued interest.`,
    },
    {
      name: specialAccountName,
      swatch: "bg-chart-2",
      amount: selectedDistribution.retirement,
      body: figures.isRetirementAccount
        ? `After the SA closure from age ${retirementAge}, this retirement share goes to RA. The published floor is ${methodology.specialMediSaveRetirementAccounts.floorRate.toFixed(2)}% a year.`
        : `Retirement savings at a published floor of ${methodology.specialMediSaveRetirementAccounts.floorRate.toFixed(2)}% a year, plus extra interest on the first ${formatCurrency(extraInterest.below55.balanceCap, 0)} of combined balances. SA closes from age ${retirementAge}.`,
    },
    {
      name: "MediSave Account",
      swatch: "bg-chart-3",
      amount: selectedDistribution.ma,
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
              value: selectedDistribution.oa,
              color: "chart-1",
            },
            {
              label: `${figures.isRetirementAccount ? "Retirement" : "Special"} ${formatRate(figures.retirementRate)}`,
              value: selectedDistribution.retirement,
              color: "chart-2",
            },
            {
              label: `MediSave ${formatRate(figures.maRate)}`,
              value: selectedDistribution.ma,
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

interface RoutingBranchCardProps {
  title: string;
  body: string;
  total: number;
  distribution: ContributionAllocationBranch;
}

function RoutingBranchCard({
  title,
  body,
  total,
  distribution,
}: RoutingBranchCardProps): ReactElement {
  const rows: Array<{
    key: "OA" | "RA" | "MA";
    name: string;
    value: number;
    color: SplitBarColor;
  }> = [
    {
      key: "OA",
      name: "Ordinary Account",
      value: distribution.OA,
      color: "chart-1",
    },
    {
      key: "RA",
      name: "Retirement Account",
      value: distribution.RA,
      color: "chart-2",
    },
    {
      key: "MA",
      name: "MediSave Account",
      value: distribution.MA,
      color: "chart-3",
    },
  ];

  return (
    <Surface className="flex flex-col gap-4 rounded-2xl p-4" variant="tertiary">
      <div className="flex flex-col gap-2">
        <Typography type="body-sm" weight="semibold">
          {title}
        </Typography>
        <Typography color="muted" type="body-xs">
          {body}
        </Typography>
      </div>
      <SplitBar
        formatValue={(value) => formatCurrency(value)}
        segments={rows
          .filter((row) => row.value > 0)
          .map((row) => ({
            label: row.key,
            value: row.value,
            color: row.color,
          }))}
        size="md"
      />
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div className="flex justify-between gap-4" key={row.key}>
            <Typography color="muted" type="body-xs">
              {row.name}
            </Typography>
            <Typography type="body-xs" weight="semibold">
              {formatCurrency(row.value)}
            </Typography>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between gap-4">
          <Typography type="body-xs" weight="semibold">
            Total
          </Typography>
          <Typography type="body-xs" weight="semibold">
            {formatCurrency(total)}
          </Typography>
        </div>
      </div>
    </Surface>
  );
}
