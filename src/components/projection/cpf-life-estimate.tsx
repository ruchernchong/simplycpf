import { Card, Surface } from "@heroui/react";
import { KPI } from "@heroui-pro/react/kpi";
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
              <KPI className="gap-2" key={option.label}>
                <KPI.Header>
                  <KPI.Title className="font-medium text-foreground text-sm">
                    {option.label}
                  </KPI.Title>
                </KPI.Header>
                <KPI.Content>
                  <KPI.Value
                    className="font-semibold text-2xl text-foreground"
                    currency="SGD"
                    locale="en-SG"
                    maximumFractionDigits={0}
                    style="currency"
                    value={option.value}
                  >
                    {(formatted) => (
                      <span className="flex items-baseline gap-2">
                        <span>{formatted}</span>
                        <span className="font-normal text-muted text-sm">
                          per month
                        </span>
                      </span>
                    )}
                  </KPI.Value>
                </KPI.Content>
                <KPI.Footer className="text-muted text-sm">
                  {option.description}
                </KPI.Footer>
              </KPI>
            ))}
          </div>
        ) : (
          <Surface
            className="flex flex-col gap-2 rounded-lg p-4"
            variant="tertiary"
          >
            <p className="font-medium text-foreground text-sm">
              Your projected RA balance is still below the S$60,000 threshold
              used for the current CPF LIFE estimate.
            </p>
            <p className="text-muted text-sm">
              Try extending the projection horizon, increasing income, or adding
              a top-up to see how the estimate changes.
            </p>
          </Surface>
        )}
      </Card.Content>
    </Card>
  );
}
