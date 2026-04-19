import {
  CPF_ADDITIONAL_SENIOR_INTEREST_CAP,
  CPF_EXTRA_INTEREST_CAP,
  CPF_EXTRA_INTEREST_RATE,
  CPF_OA_EXTRA_INTEREST_CAP,
} from "@/constants/cpf-interest-tiers";
import { formatCurrency } from "@/lib/format";

interface Tier {
  label: string;
  caption: string;
  bonus: string;
}

const extraPercent = `+${(CPF_EXTRA_INTEREST_RATE * 100).toFixed(2)}%`;
const seniorPercent = `+${(CPF_EXTRA_INTEREST_RATE * 200).toFixed(2)}%`;

const tiers: Tier[] = [
  {
    label: `First ${formatCurrency(CPF_OA_EXTRA_INTEREST_CAP, 0)} OA`,
    caption: "Extra interest under age 55",
    bonus: extraPercent,
  },
  {
    label: `Next ${formatCurrency(CPF_EXTRA_INTEREST_CAP, 0)} combined`,
    caption: "OA, SA, MA, RA under 55",
    bonus: extraPercent,
  },
  {
    label: `Next ${formatCurrency(CPF_ADDITIONAL_SENIOR_INTEREST_CAP, 0)} (age 55+)`,
    caption: "Enhanced retirement tier",
    bonus: seniorPercent,
  },
];

export default function ExtraInterestTiers() {
  return (
    <section
      aria-label="Extra interest tiers"
      className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-[16px] text-foreground">
          Extra Interest Tiers
        </h2>
        <p className="text-[12px] text-muted-foreground">
          CPF pays additional interest on the first dollars you hold. Age 55+
          members get an extra 1% tier on top.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {tiers.map(({ label, caption, bonus }) => (
          <div
            key={label}
            className="flex flex-col gap-1 rounded-md bg-accent/5 p-4 ring-1 ring-accent/20"
          >
            <p className="text-[12px] text-muted-foreground">{label}</p>
            <p className="font-bold font-mono text-[18px] text-accent">
              {bonus}
            </p>
            <p className="text-[11px] text-muted-foreground">{caption}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
