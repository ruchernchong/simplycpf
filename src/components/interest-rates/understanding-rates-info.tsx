import {
  CPF_ACCOUNT_INTEREST_MAP,
  CPF_INTEREST_FLOOR_RATES,
} from "@/constants/cpf-interest-rates";
import { formatPercentage } from "@/lib/format";

interface ExplainerRow {
  term: string;
  definition: string;
}

const ROWS: ExplainerRow[] = [
  {
    term: "Floor Rate",
    definition:
      "The minimum guaranteed interest rate your CPF accounts will earn, regardless of market conditions.",
  },
  {
    term: "Pegged Rate",
    definition:
      "For SMRA accounts, the interest rate is linked to the 12-month average of the 10-year Singapore Government Securities (SGS) yield, plus 1%.",
  },
  {
    term: "Actual Rate",
    definition:
      "You always receive the higher of the two rates — either the pegged rate or the floor rate.",
  },
];

export default function UnderstandingRatesInfo() {
  return (
    <section
      aria-label="Understanding CPF interest rates"
      className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-[16px] text-foreground">
          Understanding CPF Interest Rates
        </h2>
        <p className="text-[12px] text-muted-foreground">
          OA earns a fixed floor rate. SMRA accounts earn the higher of a pegged
          rate or a floor rate.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-md border border-border/60 bg-muted/40 p-4">
          <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.08em]">
            {CPF_ACCOUNT_INTEREST_MAP.OA}
          </p>
          <p className="font-bold font-mono text-[22px] text-foreground">
            {formatPercentage(CPF_INTEREST_FLOOR_RATES.OA / 100, {
              decimalPlaces: 1,
            })}{" "}
            p.a.
          </p>
          <p className="text-[11px] text-muted-foreground">
            Fixed floor rate (not pegged to SGS)
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-md border border-accent/30 bg-accent/5 p-4">
          <p className="font-semibold text-[11px] text-accent uppercase tracking-[0.08em]">
            {CPF_ACCOUNT_INTEREST_MAP.SMRA}
          </p>
          <p className="font-bold font-mono text-[22px] text-accent">
            {formatPercentage(CPF_INTEREST_FLOOR_RATES.SMRA / 100, {
              decimalPlaces: 1,
            })}{" "}
            p.a.
          </p>
          <p className="text-[11px] text-muted-foreground">
            Floor rate (minimum guaranteed)
          </p>
          <div className="flex flex-col gap-[2px] rounded bg-card/80 p-2 ring-1 ring-border">
            <p className="font-semibold text-[10px] text-foreground uppercase tracking-[0.06em]">
              Pegged Formula
            </p>
            <p className="text-[11px] text-muted-foreground">
              10-year SGS yield + 1% OR floor rate, whichever is higher
            </p>
          </div>
        </div>
      </div>

      <dl className="flex flex-col divide-y divide-border">
        {ROWS.map(({ term, definition }) => (
          <div
            key={term}
            className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[140px_1fr] sm:gap-4"
          >
            <dt className="font-semibold text-[13px] text-foreground">
              {term}
            </dt>
            <dd className="text-[13px] text-muted-foreground leading-[1.55]">
              {definition}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
