import { Card, Typography } from "@heroui/react";
import { formatCurrency } from "@/lib/format";
import { CPF_POLICY_RULES } from "@/policy";
import type { AccountBalances, ProjectionResult } from "@/types";

interface MilestoneCardsProps {
  result: ProjectionResult;
}

function getTotalBalance(balances: AccountBalances): number {
  return balances.oa + balances.sa + balances.ma + balances.ra;
}

export default function MilestoneCards({ result }: MilestoneCardsProps) {
  const retirementAccountAge =
    CPF_POLICY_RULES.lifecycleAges.retirementAccountCreated;
  const payoutEligibilityAge =
    CPF_POLICY_RULES.lifecycleAges.cpfLifePayoutEligibility;
  const latestPayoutStartAge =
    CPF_POLICY_RULES.lifecycleAges.latestCpfLifePayoutStart;
  const milestones = [
    {
      age: retirementAccountAge,
      balances: result.milestones.age55,
      available: result.yearlyBalances.some(
        ({ age }) => age === retirementAccountAge,
      ),
      description:
        result.assumptions.retirementRouting === "full-retirement-sum"
          ? "SA, then OA, is routed to RA up to the cohort FRS; remaining SA moves to OA after closure."
          : "Shows the selected BRS cash branch with an eligible property pledge. Later contributions and MediSave overflow still refill RA towards the cohort FRS; actual eligibility must be confirmed with CPF.",
    },
    {
      age: payoutEligibilityAge,
      balances: result.milestones.age65,
      available: result.yearlyBalances.some(
        ({ age }) => age === payoutEligibilityAge,
      ),
      description:
        "A useful checkpoint for retirement readiness and CPF LIFE planning.",
    },
    {
      age: latestPayoutStartAge,
      balances: result.milestones.age70,
      available: result.yearlyBalances.some(
        ({ age }) => age === latestPayoutStartAge,
      ),
      description:
        "A balance checkpoint only; CPF LIFE payout deferment is not estimated here.",
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
                  <Typography color="muted" type="body-xs">
                    Total projected CPF
                  </Typography>
                  <Typography type="h3">
                    {formatCurrency(getTotalBalance(milestone.balances), 0)}
                  </Typography>
                </div>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Typography color="muted" type="body-sm">
                      OA
                    </Typography>
                    <Typography type="body-sm">
                      {formatCurrency(milestone.balances.oa, 0)}
                    </Typography>
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography color="muted" type="body-sm">
                      SA
                    </Typography>
                    <Typography type="body-sm">
                      {formatCurrency(milestone.balances.sa, 0)}
                    </Typography>
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography color="muted" type="body-sm">
                      MA
                    </Typography>
                    <Typography type="body-sm">
                      {formatCurrency(milestone.balances.ma, 0)}
                    </Typography>
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography color="muted" type="body-sm">
                      RA
                    </Typography>
                    <Typography type="body-sm">
                      {formatCurrency(milestone.balances.ra, 0)}
                    </Typography>
                  </div>
                </div>
              </div>
            ) : (
              <Typography color="muted" type="body-sm">
                Extend your projection to age {milestone.age} to see this
                milestone.
              </Typography>
            )}
          </Card.Content>
        </Card>
      ))}
    </div>
  );
}
