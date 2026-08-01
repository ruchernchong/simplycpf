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
      available: result.milestones.age55 !== undefined,
      description:
        result.assumptions.retirementRouting === "full-retirement-sum"
          ? "SA, then OA, is routed to RA up to the cohort FRS; remaining SA moves to OA after closure."
          : "Shows the selected property branch after the FRS transfer and an eligible RA withdrawal down to BRS. Cash plus property satisfies the FRS test for MediSave overflow, while later employment contributions refill RA cash principal towards FRS; confirm actual eligibility with CPF.",
    },
    {
      age: payoutEligibilityAge,
      balances: result.milestones.age65,
      available: result.milestones.age65 !== undefined,
      description:
        "Pre-CPF-LIFE checkpoint for retirement planning; premiums and payouts are not deducted.",
    },
    {
      age: latestPayoutStartAge,
      balances: result.milestones.age70,
      available: result.milestones.age70 !== undefined,
      description:
        "Opening balance checkpoint immediately before the 70th-birthday month. CPF payouts must start in that month and are not modelled here.",
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
