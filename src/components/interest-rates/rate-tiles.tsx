import { Card, cn, Typography } from "@heroui/react";
import { CPF_POLICY_CATALOGUE } from "@/policy";

function thousands(value: number) {
  return `$${value.toLocaleString("en-SG")}`;
}

const interestMethodology = CPF_POLICY_CATALOGUE.interestRateMethodology;
const extraInterest = CPF_POLICY_CATALOGUE.rules.extraInterest;

interface Tile {
  label: string;
  value: string;
  note: string;
  accent?: boolean;
}

const tiles: Tile[] = [
  {
    label: "Ordinary Account",
    value: `${interestMethodology.ordinaryAccount.floorRate.toFixed(2)}%`,
    note: "A legislated floor rate, applied per year on the balance.",
  },
  {
    label: "SA · MA · RA",
    value: `${interestMethodology.specialMediSaveRetirementAccounts.floorRate.toFixed(2)}%`,
    note: `${interestMethodology.specialMediSaveRetirementAccounts.peg}, plus ${interestMethodology.specialMediSaveRetirementAccounts.markupPercentagePoints} percentage point, subject to the published floor.`,
  },
  {
    label: "Extra, under 55",
    value: `+${extraInterest.below55.extraPercentagePoints.toFixed(2)}%`,
    note: `On the first ${thousands(extraInterest.below55.balanceCap)} combined, of which at most ${thousands(extraInterest.ordinaryAccountCap)} from OA.`,
    accent: true,
  },
  {
    label: "Extra, 55 and over",
    value: `+${extraInterest.age55AndAbove.firstTier.extraPercentagePoints.toFixed(2)}%`,
    note: `On the first ${thousands(extraInterest.age55AndAbove.firstTier.balanceCap)}, then +${extraInterest.age55AndAbove.secondTier.extraPercentagePoints.toFixed(0)}% on the next ${thousands(extraInterest.age55AndAbove.secondTier.balanceCap)}.`,
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
