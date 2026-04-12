import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CPF_INCOME_CEILING } from "@/constants";
import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";
import { ageGroups } from "@/data";

const CpfStatisticBlock = () => {
  const currentCeiling = CPF_INCOME_CEILING["2025-01-01"];
  const finalCeiling = CPF_INCOME_CEILING["2026-01-01"];
  const defaultGroup = ageGroups[0];

  const stats = [
    {
      label: "Total contribution rate (age ≤ 55)",
      value: `${((defaultGroup.contributionRate.employee + defaultGroup.contributionRate.employer) * 100).toFixed(0)}%`,
      detail: "20% employee + 17% employer",
    },
    {
      label: "Current income ceiling (2025)",
      value: `S$${currentCeiling.toLocaleString()}`,
      detail: "Rising to S$8,000 in 2026",
    },
    {
      label: "OA interest rate (floor)",
      value: `${CPF_INTEREST_FLOOR_RATES.OA}% p.a.`,
      detail: "Fixed, not pegged to SGS",
    },
    {
      label: "SMRA interest rate (floor)",
      value: `${CPF_INTEREST_FLOOR_RATES.SMRA}% p.a.`,
      detail: "Minimum guaranteed; may earn more",
    },
    {
      label: "Age brackets",
      value: "8",
      detail: "From ≤35 to 70+",
    },
    {
      label: "Ceiling increase (2023–2026)",
      value: "33.3%",
      detail: `S$6,000 → S$${finalCeiling.toLocaleString()}`,
    },
  ];

  return (
    <section aria-labelledby="cpf-statistics" data-content-block="statistics">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle id="cpf-statistics">Key CPF Numbers at a Glance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border bg-muted/30 p-4"
              >
                <p className="mb-2 text-muted-foreground text-sm">
                  {stat.label}
                </p>
                <p className="font-bold font-mono text-2xl text-foreground">
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-xs">{stat.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default CpfStatisticBlock;
