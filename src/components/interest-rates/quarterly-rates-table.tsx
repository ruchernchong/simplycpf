import {
  CPF_ACCOUNT_INTEREST_MAP,
  QUARTERLY_CPF_RATES,
} from "@/constants/cpf-interest-rates";
import { formatPercentage } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { QuarterlyRate } from "@/types";

const ACCOUNT_KEYS = ["oa", "sa", "ma", "ra"] as const;

const formatRate = (value: number) =>
  formatPercentage(value / 100, { decimalPlaces: 2 });

const isFloorApplied = (rate: QuarterlyRate) =>
  rate.quarter.startsWith("2025") && rate.sa === 4.0;

export function QuarterlyRatesTable() {
  return (
    <section
      aria-label="Quarterly CPF interest rates"
      className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-[16px] text-foreground">
          Quarterly Interest Rates (2024 – 2025)
        </h2>
        <p className="text-[12px] text-muted-foreground">
          Highlighted quarters indicate when the 4% SMRA floor was applied
          because the pegged rate fell below it.
        </p>
      </div>

      <div className="hidden md:block">
        <div className="grid grid-cols-5 gap-4 border-border border-b pb-3 text-[11px] text-muted-foreground uppercase tracking-[0.08em]">
          <p className="font-semibold">Quarter</p>
          {ACCOUNT_KEYS.map((key) => (
            <p key={key} className="text-right font-semibold">
              {key.toUpperCase()}
            </p>
          ))}
        </div>
        {QUARTERLY_CPF_RATES.map((rate) => (
          <div
            key={rate.quarter}
            className={cn(
              "-mx-3 grid grid-cols-5 gap-4 rounded-md px-3 py-3 text-[13px]",
              isFloorApplied(rate) && "bg-accent/10",
            )}
          >
            <p className="font-medium text-foreground">{rate.quarter}</p>
            {ACCOUNT_KEYS.map((key) => (
              <p
                key={key}
                className="text-right font-mono text-muted-foreground"
              >
                {formatRate(rate[key])}
              </p>
            ))}
          </div>
        ))}
      </div>

      <div className="rounded-md bg-accent/5 p-4 ring-1 ring-accent/20">
        <p className="text-[12px] text-muted-foreground leading-[1.55]">
          <span className="font-semibold text-accent">Note:</span> Highlighted
          quarters indicate when the 4% floor rate was applied because the
          pegged rate (10-year SGS + 1%) fell below the floor.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {QUARTERLY_CPF_RATES.map((rate) => {
          const floor = isFloorApplied(rate);
          return (
            <div
              key={rate.quarter}
              className={cn(
                "flex flex-col gap-2 rounded-md border border-border p-3",
                floor && "border-accent/40 bg-accent/10",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[14px] text-foreground">
                  {rate.quarter}
                </p>
                {floor && (
                  <span className="rounded-full bg-accent px-2 py-[2px] font-medium text-[10px] text-accent-foreground uppercase tracking-[0.08em]">
                    Floor Applied
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                {ACCOUNT_KEYS.map((key) => (
                  <div key={key} className="flex flex-col gap-[2px]">
                    <p className="text-muted-foreground">
                      {CPF_ACCOUNT_INTEREST_MAP[key.toUpperCase()]}
                    </p>
                    <p className="font-medium font-mono text-foreground">
                      {formatRate(rate[key])}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default QuarterlyRatesTable;
