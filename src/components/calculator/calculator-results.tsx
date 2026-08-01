"use client";

import { Card, Chip, cn, Surface, Typography } from "@heroui/react";
import { KPI } from "@heroui-pro/react";
import { formatCurrency } from "@/lib/format";
import { AssumptionsCard } from "./assumptions-card";
import { CeilingComparisonCard } from "./ceiling-comparison-card";
import { DistributionCard } from "./distribution-card";
import type { CalculatorFigures } from "./figures";
import { formatRate, ILLUSTRATIVE_AGE, ILLUSTRATIVE_INCOME } from "./figures";

interface CalculatorResultsProps {
  figures: CalculatorFigures;
}

/** The ink tile and the accent tile are the two fixed emphases in the KPI row. */
type TileTone = "accent" | "inverse" | "plain";

export function CalculatorResults({ figures }: CalculatorResultsProps) {
  const isAboveCeiling = figures.gross > figures.ceiling;

  const tiles: {
    label: string;
    value: number;
    note: string;
    tone: TileTone;
  }[] = [
    {
      label: "Take-home",
      value: figures.takeHome,
      note: `${formatRate(figures.takeHomeShare)} of gross`,
      tone: "inverse",
    },
    {
      label: "From your pay",
      value: figures.employee,
      note: `${formatRate(figures.employeeRate)} effective after CPF rounding`,
      tone: "plain",
    },
    {
      label: "From employer",
      value: figures.employer,
      note: `${formatRate(figures.employerRate)} effective, on top of pay`,
      tone: "plain",
    },
    {
      label: "Into CPF",
      value: figures.total,
      note: `${formatRate(figures.totalRate)} effective on ${formatCurrency(figures.contributable, 0)}`,
      tone: "accent",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card className="gap-4 p-6">
        <Card.Header>
          <Typography color="muted" type="body-xs">
            The short answer
          </Typography>
        </Card.Header>
        <Card.Content className="gap-4">
          <Typography className="max-w-[64ch] text-pretty">
            {isAboveCeiling
              ? `Your salary is above the ${formatCurrency(figures.ceiling, 0)} ceiling, so contributions stop there. You keep ${formatCurrency(figures.takeHome)}, your employer adds ${formatCurrency(figures.employer)} on top, and ${formatCurrency(figures.total)} lands in your CPF accounts.`
              : `You keep ${formatCurrency(figures.takeHome)} of ${formatCurrency(figures.gross)}. ${formatCurrency(figures.employee)} came out of your pay and your employer added ${formatCurrency(figures.employer)} on top of it, so ${formatCurrency(figures.total)} goes into your accounts.`}
          </Typography>
          {figures.isIllustrative && (
            <Typography color="muted" type="body-xs">
              Illustrative figures for {formatCurrency(ILLUSTRATIVE_INCOME, 0)}{" "}
              a month at {ILLUSTRATIVE_AGE}, enter your own numbers on the left.
            </Typography>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Chip size="sm" variant="tertiary">
              {figures.wageBandLabel}
            </Chip>
            <Typography color="muted" type="body-xs">
              {figures.wageBandDescription}
            </Typography>
          </div>
          {figures.warnings.length > 0 && (
            <Surface className="rounded-2xl p-4" variant="tertiary">
              <ul className="flex flex-col gap-2">
                {figures.warnings.map((warning) => (
                  <li key={warning.code}>
                    <Typography type="body-sm">{warning.message}</Typography>
                  </li>
                ))}
              </ul>
            </Surface>
          )}
        </Card.Content>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <KPI
            className={cn(
              "gap-2",
              tile.tone === "inverse" && "bg-foreground text-background",
              tile.tone === "accent" && "border-accent/25 bg-accent/10",
            )}
            key={tile.label}
          >
            <KPI.Header>
              <KPI.Title
                className={cn(
                  tile.tone === "inverse" ? "text-background/70" : "text-muted",
                )}
              >
                {tile.label}
              </KPI.Title>
            </KPI.Header>
            <KPI.Content>
              <KPI.Value
                className={cn(
                  tile.tone === "accent" && "text-accent",
                  tile.tone === "inverse" && "text-background",
                )}
                currency="SGD"
                locale="en-SG"
                style="currency"
                value={tile.value}
              />
            </KPI.Content>
            <KPI.Footer
              className={cn(
                tile.tone === "inverse" ? "text-background/70" : "text-muted",
              )}
            >
              {tile.note}
            </KPI.Footer>
          </KPI>
        ))}
      </div>

      <DistributionCard figures={figures} />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <CeilingComparisonCard figures={figures} />
        <AssumptionsCard
          ceiling={figures.ceiling}
          ceilingDate={figures.ceilingDate}
          citizenship={figures.citizenship}
        />
      </div>
    </div>
  );
}
