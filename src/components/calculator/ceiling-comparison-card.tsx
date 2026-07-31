"use client";

import { Card, Chip, Surface } from "@heroui/react";
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

  const previousResult = calculateCpfContribution(figures.gross, previousDate, {
    ageGroup: figures.ageGroup,
  });

  const previousTakeHome = previousResult.afterCpfContribution;
  const previousTotal = previousResult.contribution.totalContribution;

  const currentLabel = formatDate(figures.ceilingDate, "yyyy");
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
        <Card.Title className="font-semibold text-base tracking-tight">
          Why {formatDate(figures.ceilingDate, "MMMM")}&apos;s pay looked
          different
        </Card.Title>
        <span className="font-mono text-[10px] text-muted uppercase tracking-[0.12em]">
          {formatCurrency(previousCeiling, 0)} →{" "}
          {formatCurrency(figures.ceiling, 0)}
        </span>
      </Card.Header>

      <Card.Content className="gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {rows.map((row) => (
            <div className="flex flex-col gap-2" key={row.label}>
              <span className="font-mono text-[10px] text-muted uppercase tracking-[0.12em]">
                {row.label}
              </span>
              <div className="flex flex-col items-start gap-2">
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-xl tracking-tight">
                    {formatCurrency(row.current)}
                  </span>
                  <Chip size="sm" variant="soft">
                    {currentLabel}
                  </Chip>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-muted text-sm">
                    {formatCurrency(row.previous)}
                  </span>
                  <Chip size="sm" variant="tertiary">
                    {previousLabel}
                  </Chip>
                </span>
              </div>
            </div>
          ))}
        </div>

        <Surface
          className="rounded-lg p-4 text-[13px] leading-relaxed"
          variant="tertiary"
        >
          {figures.gross <= previousCeiling
            ? `Your salary sits below both the ${formatDate(previousDate, "yyyy")} and ${currentLabel} ceilings, so the increase changed nothing for you.`
            : `The ceiling rose from ${formatCurrency(previousCeiling, 0)} to ${formatCurrency(figures.ceiling, 0)}, so ${formatCurrency(deltaBase)} more of your salary is now CPF-eligible. You see ${formatCurrency(takeHomeDrop)} less in the bank and ${formatCurrency(cpfGain)} more in CPF each month, of which ${formatCurrency(employerDelta)} is your employer's money, not yours.`}
        </Surface>
      </Card.Content>
    </Card>
  );
}
