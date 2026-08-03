import { Card } from "@heroui/react";
import { KPI } from "@heroui-pro/react";
import { CPF_INCOME_CEILING } from "@/constants";
import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";

function CpfStatisticBlock() {
  const currentCeiling = CPF_INCOME_CEILING["2026-01-01"];
  const stats: Array<{
    label: string;
    value: number;
    style: "currency" | "percent";
    detail: string;
  }> = [
    {
      label: "Current income ceiling (2026)",
      value: currentCeiling,
      style: "currency",
      detail: "Final ceiling under 2023 Budget changes",
    },
    {
      label: "OA interest rate (floor)",
      value: CPF_INTEREST_FLOOR_RATES.OA / 100,
      style: "percent",
      detail: "Fixed, not pegged to SGS · p.a.",
    },
    {
      label: "SMRA interest rate (floor)",
      value: CPF_INTEREST_FLOOR_RATES.SMRA / 100,
      style: "percent",
      detail: "Minimum guaranteed; may earn more · p.a.",
    },
  ];

  return (
    <section aria-labelledby="cpf-statistics" data-content-block="statistics">
      <Card>
        <Card.Header>
          <Card.Title id="cpf-statistics">
            Key CPF Numbers at a Glance
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <KPI className="gap-2" key={stat.label}>
                <KPI.Header>
                  <KPI.Title className="text-muted text-sm">
                    {stat.label}
                  </KPI.Title>
                </KPI.Header>
                <KPI.Content>
                  <KPI.Value
                    className="font-bold font-mono text-2xl text-foreground"
                    currency={stat.style === "currency" ? "SGD" : undefined}
                    locale="en-SG"
                    maximumFractionDigits={stat.style === "percent" ? 1 : 0}
                    style={stat.style}
                    value={stat.value}
                  />
                </KPI.Content>
                <KPI.Footer className="text-muted text-xs">
                  {stat.detail}
                </KPI.Footer>
              </KPI>
            ))}
          </div>
        </Card.Content>
      </Card>
    </section>
  );
}

export default CpfStatisticBlock;
