import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { ProjectionResult, ScenarioResult } from "@/types";

interface ScenarioResultsProps {
  result: ScenarioResult;
  baselineLabel: string;
  scenarioLabel: string;
}

function getTotalBalanceAtAge(result: ProjectionResult, age: number): number {
  const yearlyBalance =
    result.yearlyBalances.find((entry) => entry.age === age) ??
    result.yearlyBalances[result.yearlyBalances.length - 1];

  return (
    yearlyBalance.balances.oa +
    yearlyBalance.balances.sa +
    yearlyBalance.balances.ma +
    yearlyBalance.balances.ra
  );
}

function formatDelta(value: number): string {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${formatCurrency(Math.abs(value), 0)}`;
}

function getDeltaClassName(value: number): string {
  if (value > 0) {
    return "text-accent";
  }

  if (value < 0) {
    return "text-destructive";
  }

  return "text-foreground";
}

export default function ScenarioResults({
  result,
  baselineLabel,
  scenarioLabel,
}: ScenarioResultsProps) {
  const baselineAge65Balance = getTotalBalanceAtAge(result.baseline, 65);
  const scenarioAge65Balance = getTotalBalanceAtAge(result.scenario, 65);

  const comparisonCards = [
    {
      label: baselineLabel,
      age65Balance: baselineAge65Balance,
      cpfLife: result.baseline.cpfLifeEstimate.standardMonthly,
      totalInterest: result.baseline.totalInterestEarned,
    },
    {
      label: scenarioLabel,
      age65Balance: scenarioAge65Balance,
      cpfLife: result.scenario.cpfLifeEstimate.standardMonthly,
      totalInterest: result.scenario.totalInterestEarned,
    },
  ];

  const differenceCards = [
    {
      label: "Age 65 balance",
      value: result.difference.age65Balance,
    },
    {
      label: "Standard CPF LIFE",
      value: result.difference.cpfLifeMonthlyPayout,
    },
    {
      label: "Total contributions",
      value: result.difference.totalContributions,
    },
    {
      label: "Interest earned",
      value: result.difference.totalInterestEarned,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {comparisonCards.map((card) => (
          <Card key={card.label} className="shadow-md">
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle>{formatCurrency(card.age65Balance, 0)}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Age 65 CPF total</span>
                <span>{formatCurrency(card.age65Balance, 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Standard CPF LIFE</span>
                <span>{formatCurrency(card.cpfLife, 0)}/month</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Total interest earned
                </span>
                <span>{formatCurrency(card.totalInterest, 0)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {differenceCards.map((card) => (
          <Card key={card.label} className="shadow-md">
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className={getDeltaClassName(card.value)}>
                {formatDelta(card.value)}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Key Takeaways</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex list-disc flex-col gap-4 pl-6 text-muted-foreground text-sm">
            {result.insights.map((insight) => (
              <li key={insight}>{insight}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
