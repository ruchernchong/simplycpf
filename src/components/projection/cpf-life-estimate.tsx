import { Card, Typography } from "@heroui/react";
import { formatCurrency } from "@/lib/format";
import type { ProjectionResult } from "@/types";

interface CpfLifeEstimateProps {
  result: ProjectionResult;
}

export default function CpfLifeEstimate({ result }: CpfLifeEstimateProps) {
  const finalYear = result.yearlyBalances[result.yearlyBalances.length - 1];
  const payoutOptions = [
    {
      label: "Standard plan",
      value: result.cpfLifeEstimate.standardMonthly,
      description:
        "A higher starting payout based on your projected RA balance.",
    },
    {
      label: "Escalating plan",
      value: result.cpfLifeEstimate.escalatingStartMonthly,
      description: "Starts lower, then grows gradually across retirement.",
    },
    {
      label: "Basic plan",
      value: result.cpfLifeEstimate.basicMonthly,
      description:
        "A lower estimated payout with more balance left in your RA.",
    },
    {
      label: "If you defer to age 70",
      value: result.cpfLifeEstimate.deferredTo70Monthly,
      description: "Uses the simplified deferment uplift in the current model.",
    },
  ];

  return (
    <Card>
      <Card.Header>
        <Card.Title>Estimated CPF LIFE Payouts</Card.Title>
        <Card.Description>
          Based on your projected Retirement Account balance of{" "}
          {formatCurrency(finalYear.balances.ra, 0)} at age {finalYear.age}.
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        {result.cpfLifeEstimate.standardMonthly > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {payoutOptions.map((option) => (
              <div
                key={option.label}
                className="rounded-2xl border border-border bg-surface-secondary p-4"
              >
                <Typography type="body-sm" weight="medium">
                  {option.label}
                </Typography>
                <div className="flex items-baseline gap-2 pb-2">
                  <Typography type="h3">
                    {formatCurrency(option.value, 0)}
                  </Typography>
                  <Typography color="muted" type="body-sm">
                    per month
                  </Typography>
                </div>
                <Typography color="muted" type="body-sm">
                  {option.description}
                </Typography>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface-secondary p-4">
            <Typography type="body-sm" weight="medium">
              Your projected RA balance is still below the S$60,000 threshold
              used for the current CPF LIFE estimate.
            </Typography>
            <Typography color="muted" type="body-sm">
              Try extending the projection horizon, increasing income, or adding
              a top-up to see how the estimate changes.
            </Typography>
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
