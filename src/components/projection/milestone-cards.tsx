import { getBhsForYear } from "@/constants/cpf-bhs";
import { formatCurrency } from "@/lib/format";
import type { AccountBalances, ProjectionResult } from "@/types";

interface MilestoneCardsProps {
  result: ProjectionResult;
}

function getTotalBalance(balances: AccountBalances): number {
  return balances.oa + balances.sa + balances.ma + balances.ra;
}

function compactCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  return formatCurrency(value, 0);
}

export default function MilestoneCards({ result }: MilestoneCardsProps) {
  const bhsMilestone = result.yearlyBalances.find(
    ({ year, balances }) => balances.ma >= getBhsForYear(year),
  );

  const milestones: {
    eyebrow: string;
    primary: string;
    description: string;
  }[] = [
    {
      eyebrow: "YOUR BHS MILESTONE",
      primary: bhsMilestone ? `Age ${bhsMilestone.age}` : "Not reached",
      description: bhsMilestone
        ? "Estimated year your MA reaches BHS."
        : "Your MA does not reach the BHS within this projection.",
    },
    {
      eyebrow: "YOUR RA AT 55",
      primary: result.yearlyBalances.some(({ age }) => age === 55)
        ? compactCurrency(result.milestones.age55.ra)
        : "Extend to 55",
      description: "Estimated balance set aside for retirement.",
    },
    {
      eyebrow: "YOUR ESTIMATED CPF AT 65",
      primary: result.yearlyBalances.some(({ age }) => age === 65)
        ? compactCurrency(getTotalBalance(result.milestones.age65))
        : "Extend to 65",
      description: "Projected across OA, SA/RA, and MA.",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {milestones.map(({ eyebrow, primary, description }) => (
        <div
          key={eyebrow}
          className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.1em]">
            {eyebrow}
          </p>
          <p className="font-bold font-mono text-2xl text-foreground">
            {primary}
          </p>
          <p className="text-[12px] text-muted-foreground">{description}</p>
        </div>
      ))}
    </div>
  );
}
