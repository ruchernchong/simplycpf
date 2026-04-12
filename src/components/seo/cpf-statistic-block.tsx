import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CPF_INCOME_CEILING } from "@/constants";
import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";

const CpfStatisticBlock = () => {
  const currentCeiling = CPF_INCOME_CEILING["2026-01-01"];
  const stats = [
    {
      label: "Current income ceiling (2026)",
      value: `S$${currentCeiling.toLocaleString()}`,
      detail: "Final ceiling under 2023 Budget changes",
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
