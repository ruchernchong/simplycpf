import { Card, cn } from "@heroui/react";
import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";
import {
  CPF_ADDITIONAL_SENIOR_INTEREST_CAP,
  CPF_EXTRA_INTEREST_CAP,
  CPF_EXTRA_INTEREST_RATE,
  CPF_OA_EXTRA_INTEREST_CAP,
} from "@/constants/cpf-interest-tiers";

function thousands(value: number) {
  return `$${value.toLocaleString("en-SG")}`;
}

const extraRate = CPF_EXTRA_INTEREST_RATE * 100;

interface Tile {
  label: string;
  value: string;
  note: string;
  accent?: boolean;
}

const tiles: Tile[] = [
  {
    label: "Ordinary Account",
    value: `${CPF_INTEREST_FLOOR_RATES.OA.toFixed(2)}%`,
    note: "A legislated floor rate, applied per year on the balance.",
  },
  {
    label: "SA · MA · RA",
    value: `${CPF_INTEREST_FLOOR_RATES.SMRA.toFixed(2)}%`,
    note: "Floor rate. Otherwise pegged to the 10-year SGS yield plus 1%.",
  },
  {
    label: "Extra, under 55",
    value: `+${extraRate.toFixed(2)}%`,
    note: `On the first ${thousands(CPF_EXTRA_INTEREST_CAP)} combined, of which at most ${thousands(CPF_OA_EXTRA_INTEREST_CAP)} from OA.`,
    accent: true,
  },
  {
    label: "Extra, 55 and over",
    value: `+${(extraRate * 2).toFixed(2)}%`,
    note: `On the first ${thousands(CPF_ADDITIONAL_SENIOR_INTEREST_CAP)}, then +${extraRate.toFixed(0)}% on the next ${thousands(CPF_ADDITIONAL_SENIOR_INTEREST_CAP)}.`,
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
