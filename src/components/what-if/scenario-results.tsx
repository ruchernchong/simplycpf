import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
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
  const sign = value >= 0 ? "+" : "−";
  return `${sign}${formatCurrency(Math.abs(value), 0)}`;
}

function deltaTone(value: number): string {
  if (value > 0) return "text-accent";
  if (value < 0) return "text-destructive";
  return "text-foreground";
}

export default function ScenarioResults({
  result,
  baselineLabel,
  scenarioLabel,
}: ScenarioResultsProps) {
  const baselineAge65 = getTotalBalanceAtAge(result.baseline, 65);
  const scenarioAge65 = getTotalBalanceAtAge(result.scenario, 65);

  const stats: { label: string; value: number; suffix?: string }[] = [
    { label: "Age 65 balance", value: result.difference.age65Balance },
    {
      label: "Standard CPF LIFE",
      value: result.difference.cpfLifeMonthlyPayout,
      suffix: "/month",
    },
    {
      label: "Total contributions",
      value: result.difference.totalContributions,
    },
    { label: "Interest earned", value: result.difference.totalInterestEarned },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.1em]">
            Baseline · {baselineLabel}
          </p>
          <p className="font-bold font-mono text-foreground text-xl">
            {formatCurrency(baselineAge65, 0)}
          </p>
          <p className="text-[12px] text-muted-foreground">
            Standard CPF LIFE:{" "}
            {formatCurrency(result.baseline.cpfLifeEstimate.standardMonthly, 0)}
            /month
          </p>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-accent/40 bg-accent/5 p-4">
          <p className="font-semibold text-[11px] text-accent uppercase tracking-[0.1em]">
            What-if · {scenarioLabel}
          </p>
          <p className="font-bold font-mono text-foreground text-xl">
            {formatCurrency(scenarioAge65, 0)}
          </p>
          <p className="text-[12px] text-muted-foreground">
            Standard CPF LIFE:{" "}
            {formatCurrency(result.scenario.cpfLifeEstimate.standardMonthly, 0)}
            /month
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, suffix }) => (
          <div
            key={label}
            className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4"
          >
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p
              className={cn(
                "font-bold font-mono text-[18px]",
                deltaTone(value),
              )}
            >
              {formatDelta(value)}
              {suffix ? (
                <span className="font-normal text-[11px] text-muted-foreground">
                  {suffix}
                </span>
              ) : null}
            </p>
          </div>
        ))}
      </div>

      {result.insights.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
          <p className="font-semibold text-[14px] text-foreground">
            Key takeaways
          </p>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-[13px] text-muted-foreground leading-[1.55]">
            {result.insights.map((insight) => (
              <li key={insight}>{insight}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
