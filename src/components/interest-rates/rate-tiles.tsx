import { Card, cn, Typography } from "@heroui/react";
import {
  CPF_INTEREST_FLOOR_RATES,
  CPF_INTEREST_RATE_METHODOLOGY,
} from "@/constants/cpf-interest-rates";
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
    note: CPF_INTEREST_RATE_METHODOLOGY.SMRA.description,
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
            <Typography
              className={tile.accent ? "text-accent" : undefined}
              color={tile.accent ? "default" : "muted"}
              type="body-xs"
            >
              {tile.label}
            </Typography>
            <Typography
              className={tile.accent ? "text-accent" : undefined}
              type="h2"
            >
              {tile.value}
            </Typography>
            <Card.Description>{tile.note}</Card.Description>
          </Card.Content>
        </Card>
      ))}
    </div>
  );
}
