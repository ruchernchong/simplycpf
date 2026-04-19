import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";

interface RateCard {
  eyebrow: string;
  rate: number;
  caption: string;
}

const cards: RateCard[] = [
  {
    eyebrow: "Ordinary Account",
    rate: CPF_INTEREST_FLOOR_RATES.OA,
    caption: "p.a. floor rate",
  },
  {
    eyebrow: "Special Account",
    rate: CPF_INTEREST_FLOOR_RATES.SMRA,
    caption: "p.a. current rate",
  },
  {
    eyebrow: "Medisave Account",
    rate: CPF_INTEREST_FLOOR_RATES.SMRA,
    caption: "p.a. current rate",
  },
  {
    eyebrow: "Retirement Account",
    rate: CPF_INTEREST_FLOOR_RATES.SMRA,
    caption: "p.a. current rate",
  },
];

export default function RateOverviewCards() {
  return (
    <section
      aria-label="Current CPF interest rates"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map(({ eyebrow, rate, caption }) => (
        <div
          key={eyebrow}
          className="flex flex-col gap-1 rounded-lg border border-border bg-card p-5 shadow-sm"
        >
          <p className="font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
            {eyebrow}
          </p>
          <p className="font-bold font-mono text-[24px] text-accent">
            {rate.toFixed(2)}%
          </p>
          <p className="text-[11px] text-muted-foreground">{caption}</p>
        </div>
      ))}
    </section>
  );
}
