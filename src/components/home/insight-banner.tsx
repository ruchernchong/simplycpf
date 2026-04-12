import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { CPF_INCOME_CEILING } from "@/constants";
import { formatCurrency } from "@/lib/format";

const InsightBanner = () => {
  const ceilings = Object.values(CPF_INCOME_CEILING);
  const initial = ceilings[0];
  const final = ceilings[ceilings.length - 1];
  const increase = final - initial;
  const percentIncrease = ((increase / initial) * 100).toFixed(0);

  return (
    <section className="rounded-lg border border-accent/20 bg-accent/5 p-4">
      <div className="flex gap-4">
        <HugeiconsIcon
          icon={InformationCircleIcon}
          className="size-5 flex-shrink-0 text-accent"
          strokeWidth={2}
        />
        <div className="flex flex-col gap-2">
          <p className="font-medium text-foreground text-sm">
            <span className="font-mono text-accent">
              {formatCurrency(increase)}
            </span>{" "}
            more of your monthly income is subject to CPF contributions
          </p>
          <p className="text-muted-foreground text-sm">
            The income ceiling rose {percentIncrease}% — from{" "}
            <span className="font-mono">{formatCurrency(initial)}</span> to{" "}
            <span className="font-mono">{formatCurrency(final)}</span>. If you
            earn above the old ceiling, your take-home pay may decrease but your
            OA, SA, and MA grow faster.
          </p>
        </div>
      </div>
    </section>
  );
};

export default InsightBanner;
