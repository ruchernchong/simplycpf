import { cn } from "@heroui/react";
import { KPI } from "@heroui-pro/react/kpi";
import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";
import {
  CPF_ADDITIONAL_SENIOR_INTEREST_CAP,
  CPF_EXTRA_INTEREST_CAP,
  CPF_EXTRA_INTEREST_RATE,
  CPF_OA_EXTRA_INTEREST_CAP,
} from "@/constants/cpf-interest-tiers";
import { formatCurrency } from "@/lib/format";

const extraRate = CPF_EXTRA_INTEREST_RATE;

interface Tile {
  label: string;
  value: number;
  note: string;
  accent?: boolean;
  signDisplay?: "always" | "auto";
}

const tiles: Tile[] = [
  {
    label: "Ordinary Account",
    value: CPF_INTEREST_FLOOR_RATES.OA / 100,
    note: "A legislated floor rate, applied per year on the balance.",
  },
  {
    label: "SA · MA · RA",
    value: CPF_INTEREST_FLOOR_RATES.SMRA / 100,
    note: "Floor rate. Otherwise pegged to the 10-year SGS yield plus 1%.",
  },
  {
    label: "Extra, under 55",
    value: extraRate,
    note: `On the first ${formatCurrency(CPF_EXTRA_INTEREST_CAP, 0)} combined, of which at most ${formatCurrency(CPF_OA_EXTRA_INTEREST_CAP, 0)} from OA.`,
    accent: true,
    signDisplay: "always",
  },
  {
    label: "Extra, 55 and over",
    value: extraRate * 2,
    note: `On the first ${formatCurrency(CPF_ADDITIONAL_SENIOR_INTEREST_CAP, 0)}, then +${(extraRate * 100).toFixed(0)}% on the next ${formatCurrency(CPF_ADDITIONAL_SENIOR_INTEREST_CAP, 0)}.`,
    accent: true,
    signDisplay: "always",
  },
];

/** The four rates every figure elsewhere on the site is built from. */
export function RateTiles() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => (
        <KPI
          key={tile.label}
          className={cn(
            "gap-2",
            tile.accent && "border-accent/25 bg-accent/10",
          )}
        >
          <KPI.Header>
            <KPI.Title
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.12em]",
                tile.accent ? "text-accent" : "text-muted",
              )}
            >
              {tile.label}
            </KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value
              className={cn(
                "font-semibold text-[30px] leading-none tracking-tight",
                tile.accent ? "text-accent" : "text-foreground",
              )}
              locale="en-SG"
              maximumFractionDigits={2}
              minimumFractionDigits={tile.accent ? 0 : 2}
              signDisplay={tile.signDisplay}
              style="percent"
              value={tile.value}
            />
          </KPI.Content>
          <KPI.Footer className="text-[12.5px] text-muted leading-relaxed">
            {tile.note}
          </KPI.Footer>
        </KPI>
      ))}
    </div>
  );
}
