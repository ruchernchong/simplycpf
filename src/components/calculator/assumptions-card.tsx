"use client";

import { Card, Separator, Typography } from "@heroui/react";
import { formatCurrency, formatDate } from "@/lib/format";
import { CPF_POLICY_CATALOGUE } from "@/policy";
import type { CitizenshipStatus } from "@/types";

interface AssumptionsCardProps {
  ceiling: number;
  ceilingDate: string;
  citizenship: CitizenshipStatus;
}

export function AssumptionsCard({
  ceiling,
  ceilingDate,
  citizenship,
}: AssumptionsCardProps) {
  const wageRules = CPF_POLICY_CATALOGUE.rules.wageBands;
  const assumptions = [
    `Ordinary Wages only. Additional Wages use a separate annual ceiling of ${formatCurrency(wageRules.annualAdditionalWageCeiling, 0)} and need annual OW and prior-AW context.`,
    `Citizenship schedule: ${citizenship}. The full-rate band starts above ${formatCurrency(wageRules.fullRatesAbove, 0)}; lower wages use CPF's phased rules.`,
    `Ordinary wage ceiling of ${formatCurrency(ceiling, 0)}, effective ${formatDate(ceilingDate, "d MMMM yyyy")}.`,
    "Shown to the cent. CPF rounds the total contribution to the nearest dollar.",
  ];

  return (
    <Card className="gap-6 p-6">
      <Card.Header>
        <Card.Title>What this assumes</Card.Title>
      </Card.Header>

      <Card.Content className="gap-6">
        <ol className="flex flex-col gap-4">
          {assumptions.map((assumption, index) => (
            <li className="flex gap-4" key={assumption}>
              <Typography color="muted" type="body-xs">
                {String(index + 1).padStart(2, "0")}
              </Typography>
              <Typography type="body-sm">{assumption}</Typography>
            </li>
          ))}
        </ol>

        <Separator />

        <Typography color="muted" type="body-xs">
          Estimates only, not financial advice. Check against your CPF
          statement.
        </Typography>
      </Card.Content>
    </Card>
  );
}
