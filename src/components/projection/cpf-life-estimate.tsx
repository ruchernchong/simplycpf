import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Estimated CPF LIFE Payouts</CardTitle>
        <CardDescription>
          Based on your projected Retirement Account balance of{" "}
          {formatCurrency(finalYear.balances.ra, 0)} at age {finalYear.age}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {result.cpfLifeEstimate.standardMonthly > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {payoutOptions.map((option) => (
              <div
                key={option.label}
                className="rounded-lg border border-border bg-muted/30 p-4"
              >
                <p className="font-medium text-foreground text-sm">
                  {option.label}
                </p>
                <p className="pb-2 font-semibold text-2xl text-foreground">
                  {formatCurrency(option.value, 0)}
                  <span className="pl-2 font-normal text-muted-foreground text-sm">
                    per month
                  </span>
                </p>
                <p className="text-muted-foreground text-sm">
                  {option.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="font-medium text-foreground text-sm">
              Your projected RA balance is still below the S$60,000 threshold
              used for the current CPF LIFE estimate.
            </p>
            <p className="text-muted-foreground text-sm">
              Try extending the projection horizon, increasing income, or adding
              a top-up to see how the estimate changes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
