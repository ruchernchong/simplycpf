"use client";

import { Card, Separator, Typography } from "@heroui/react";
import { CPF_ADDITIONAL_WAGE_CEILING } from "@/constants";
import { formatCurrency, formatDate } from "@/lib/format";

interface AssumptionsCardProps {
  ceiling: number;
  ceilingDate: string;
}

export function AssumptionsCard({
  ceiling,
  ceilingDate,
}: AssumptionsCardProps) {
  const assumptions = [
    `Ordinary wages only. Bonuses sit under the ${formatCurrency(CPF_ADDITIONAL_WAGE_CEILING, 0)} annual ceiling.`,
    "Citizen or PR from the 3rd year, earning above $750 a month.",
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
