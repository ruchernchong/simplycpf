import { ChartColumnIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { CPF_INCOME_CEILING } from "@/constants";
import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";
import { formatCurrency } from "@/lib/format";

const CpfStatisticBlock = () => {
  const currentCeiling = CPF_INCOME_CEILING["2026-01-01"];
  const stats = [
    {
      label: "Income Ceiling",
      value: formatCurrency(currentCeiling, 0),
      detail: "Monthly cap from Jan 2026",
      accent: false,
    },
    {
      label: "OA Interest Rate",
      value: `${CPF_INTEREST_FLOOR_RATES.OA.toFixed(2)}%`,
      detail: "Floor rate per annum",
      accent: false,
    },
    {
      label: "SMRA Interest Rate",
      value: `${CPF_INTEREST_FLOOR_RATES.SMRA.toFixed(2)}%`,
      detail: "Floor rate per annum",
      accent: false,
    },
    {
      label: "Extra Interest",
      value: "+1.00%",
      detail: "Up to age 55 on first $60k",
      accent: true,
    },
  ];

  return (
    <section
      aria-labelledby="cpf-statistics"
      data-content-block="statistics"
      className="flex flex-col gap-3"
    >
      <div className="flex items-center gap-2">
        <HugeiconsIcon
          icon={ChartColumnIcon}
          className="size-[18px] text-accent"
          strokeWidth={2}
          aria-hidden="true"
        />
        <h2
          id="cpf-statistics"
          className="font-semibold text-foreground text-xl"
        >
          Key Numbers
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-6"
          >
            <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.1em]">
              {stat.label}
            </p>
            <p
              className={`font-bold font-mono text-4xl ${
                stat.accent ? "text-accent" : "text-foreground"
              }`}
            >
              {stat.value}
            </p>
            <p className="text-[13px] text-muted-foreground">{stat.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CpfStatisticBlock;
