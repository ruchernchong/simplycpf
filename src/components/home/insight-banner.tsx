import { ChartUpIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { CPF_INCOME_CEILING } from "@/constants";
import { formatCurrency } from "@/lib/format";

const InsightBanner = () => {
  const ceilings = Object.values(CPF_INCOME_CEILING);
  const initial = ceilings[0];
  const final = ceilings[ceilings.length - 1];

  return (
    <section
      className="insight-banner flex flex-col gap-3 rounded-lg bg-accent p-5 text-accent-foreground shadow-md"
      aria-labelledby="insight-heading"
    >
      <div className="flex items-center gap-2">
        <HugeiconsIcon
          icon={ChartUpIcon}
          className="size-[18px]"
          strokeWidth={2}
          aria-hidden="true"
        />
        <h2 id="insight-heading" className="font-semibold text-[15px]">
          Ceiling Change Summary
        </h2>
      </div>
      <p className="text-[13px] leading-[1.55] opacity-95">
        The monthly income ceiling increased from{" "}
        <span className="font-mono font-semibold">
          {formatCurrency(initial, 0)}
        </span>{" "}
        before September 2023 to{" "}
        <span className="font-mono font-semibold">
          {formatCurrency(final, 0)}
        </span>{" "}
        from January 2026. This changes both contribution amounts and take-home
        pay for affected income levels.
      </p>
    </section>
  );
};

export default InsightBanner;
