import { Card, cn } from "@heroui/react";
import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";
import {
  CPF_ADDITIONAL_SENIOR_INTEREST_CAP,
  CPF_EXTRA_INTEREST_CAP,
  CPF_EXTRA_INTEREST_RATE,
  CPF_OA_EXTRA_INTEREST_CAP,
} from "@/constants/cpf-interest-tiers";
import { formatCurrency, formatPercentage } from "@/lib/format";

const extraRate = CPF_EXTRA_INTEREST_RATE;

interface Tile {
  label: string;
  value: string;
  note: string;
  accent?: boolean;
}

const tiles: Tile[] = [
  {
    label: "Ordinary Account",
    value: formatPercentage(CPF_INTEREST_FLOOR_RATES.OA / 100),
    note: "A legislated floor rate, applied per year on the balance.",
  },
  {
    label: "SA · MA · RA",
    value: formatPercentage(CPF_INTEREST_FLOOR_RATES.SMRA / 100),
    note: "Floor rate. Otherwise pegged to the 10-year SGS yield plus 1%.",
  },
  {
    label: "Extra, under 55",
    value: `+${formatPercentage(extraRate)}`,
    note: `On the first ${formatCurrency(CPF_EXTRA_INTEREST_CAP, 0)} combined, of which at most ${formatCurrency(CPF_OA_EXTRA_INTEREST_CAP, 0)} from OA.`,
    accent: true,
  },
  {
    label: "Extra, 55 and over",
    value: `+${formatPercentage(extraRate * 2)}`,
    note: `On the first ${formatCurrency(CPF_ADDITIONAL_SENIOR_INTEREST_CAP, 0)}, then +${formatPercentage(extraRate, { decimalPlaces: 0 })} on the next ${formatCurrency(CPF_ADDITIONAL_SENIOR_INTEREST_CAP, 0)}.`,
    accent: true,
  },
];

/** The four rates every figure elsewhere on the site is built from. */
export function RateTiles() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Card
          key={tile.label}
          className={cn(tile.accent && "border-accent/25 bg-accent/10")}
        >
          <Card.Content className="flex flex-col gap-2">
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.12em]",
                tile.accent ? "text-accent" : "text-muted",
              )}
            >
              {tile.label}
            </span>
            <span
              className={cn(
                "font-semibold text-[30px] leading-none tracking-tight",
                tile.accent ? "text-accent" : "text-foreground",
              )}
            >
              {tile.value}
            </span>
            <Card.Description className="text-[12.5px] text-muted leading-relaxed">
              {tile.note}
            </Card.Description>
          </Card.Content>
        </Card>
      ))}
    </div>
  );
}
