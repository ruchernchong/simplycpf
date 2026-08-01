"use client";

import { Card, Chip, Surface, Typography } from "@heroui/react";
import { CPF_INCOME_CEILING } from "@/constants";
import { calculateCpfContribution } from "@/lib/calculate-cpf-contribution";
import { formatCurrency, formatDate } from "@/lib/format";
import type { CalculatorFigures } from "./figures";
import { findPreviousCeilingDate } from "./figures";

interface CeilingComparisonCardProps {
  figures: CalculatorFigures;
}

export function CeilingComparisonCard({ figures }: CeilingComparisonCardProps) {
  const previousDate = findPreviousCeilingDate(figures.ceilingDate);
  const previousCeiling = CPF_INCOME_CEILING[previousDate];

  const previousInputBase = {
    contributionMonth: figures.contributionMonth,
    ordinaryWages: Math.min(figures.gross, previousCeiling),
    citizenship: figures.citizenship,
  };
  const previousResult = calculateCpfContribution(
    figures.birthMonth
      ? { ...previousInputBase, birthMonth: figures.birthMonth }
      : { ...previousInputBase, age: figures.age },
  );

  const previousTakeHome = figures.gross - previousResult.contribution.employee;
  const previousTotal = previousResult.contribution.totalContribution;

  const currentLabel = "Current ceiling";
  const previousLabel = `${formatDate(previousDate, "yyyy")} ceiling`;

  const deltaBase =
    Math.min(figures.gross, figures.ceiling) -
    Math.min(figures.gross, previousCeiling);
  const takeHomeDrop = previousTakeHome - figures.takeHome;
  const cpfGain = figures.total - previousTotal;
  const employerDelta = figures.employer - previousResult.contribution.employer;

  const rows = [
    {
      label: "Your take-home",
      current: figures.takeHome,
      previous: previousTakeHome,
    },
    {
      label: "Total into CPF",
      current: figures.total,
      previous: previousTotal,
    },
  ];

  return (
    <Card className="gap-6 p-6">
      <Card.Header className="flex-row flex-wrap items-baseline justify-between gap-2">
        <Card.Title>What the latest ceiling step changes</Card.Title>
        <Typography color="muted" type="body-xs">
          {formatCurrency(previousCeiling, 0)} →{" "}
          {formatCurrency(figures.ceiling, 0)}
        </Typography>
      </Card.Header>

      <Card.Content className="gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {rows.map((row) => (
            <div className="flex flex-col gap-2" key={row.label}>
              <Typography color="muted" type="body-xs">
                {row.label}
              </Typography>
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <Typography type="h4">
                    {formatCurrency(row.current)}
                  </Typography>
                  <Chip size="sm" variant="soft">
                    {currentLabel}
                  </Chip>
                </div>
                <div className="flex items-center gap-2">
                  <Typography color="muted" type="body-sm">
                    {formatCurrency(row.previous)}
                  </Typography>
                  <Chip size="sm" variant="tertiary">
                    {previousLabel}
                  </Chip>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Surface className="rounded-2xl p-4" variant="tertiary">
          <Typography type="body-sm">
            {figures.gross <= previousCeiling
              ? `Your salary sits below both the previous and current ceilings, so the increase changed nothing for you.`
              : `Holding this month's contribution rates and age band constant, the ceiling step from ${formatCurrency(previousCeiling, 0)} to ${formatCurrency(figures.ceiling, 0)} makes ${formatCurrency(deltaBase)} more of your salary CPF-eligible. You see ${formatCurrency(takeHomeDrop)} less in the bank and ${formatCurrency(cpfGain)} more in CPF each month, of which ${formatCurrency(employerDelta)} is your employer's money, not yours.`}
          </Typography>
        </Surface>
      </Card.Content>
    </Card>
  );
}
