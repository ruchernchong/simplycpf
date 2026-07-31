import { Card } from "@heroui/react";
import { formatCurrency } from "@/lib/format";
import type { AccountBalances, ProjectionResult } from "@/types";

interface MilestoneCardsProps {
  result: ProjectionResult;
}

function getTotalBalance(balances: AccountBalances): number {
  return balances.oa + balances.sa + balances.ma + balances.ra;
}

export default function MilestoneCards({ result }: MilestoneCardsProps) {
  const milestones = [
    {
      age: 55,
      balances: result.milestones.age55,
      available: result.yearlyBalances.some(({ age }) => age === 55),
      description:
        "Special Account funds move into your Retirement Account up to the FRS.",
    },
    {
      age: 65,
      balances: result.milestones.age65,
      available: result.yearlyBalances.some(({ age }) => age === 65),
      description:
        "A useful checkpoint for retirement readiness and CPF LIFE planning.",
    },
    {
      age: 70,
      balances: result.milestones.age70,
      available: result.yearlyBalances.some(({ age }) => age === 70),
      description:
        "Extending the projection helps you see the value of delaying payouts.",
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {milestones.map((milestone) => (
        <Card key={milestone.age}>
          <Card.Header>
            <Card.Title>Age {milestone.age}</Card.Title>
            <Card.Description>{milestone.description}</Card.Description>
          </Card.Header>
          <Card.Content>
            {milestone.available && milestone.balances ? (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Total projected CPF
                  </p>
                  <p className="font-semibold text-2xl text-foreground">
                    {formatCurrency(getTotalBalance(milestone.balances), 0)}
                  </p>
                </div>
                <div className="grid gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">OA</span>
                    <span>{formatCurrency(milestone.balances.oa, 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">SA</span>
                    <span>{formatCurrency(milestone.balances.sa, 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">MA</span>
                    <span>{formatCurrency(milestone.balances.ma, 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">RA</span>
                    <span>{formatCurrency(milestone.balances.ra, 0)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Extend your projection to age {milestone.age} to see this
                milestone.
              </p>
            )}
          </Card.Content>
        </Card>
      ))}
    </div>
  );
}
