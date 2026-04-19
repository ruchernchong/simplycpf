"use client";

import {
  CPF_INCOME_CEILING,
  CPF_INCOME_CEILING_BEFORE_SEPT_2023,
} from "@/constants";
import useAnimatedNumber from "@/hooks/use-animated-number";
import { useCpfStore } from "@/hooks/use-cpf-store";
import { formatCurrency } from "@/lib/format";
import { selectLatestIncomeCeilingDate } from "@/stores/selectors";

const Banner = () => {
  const latestIncomeCeilingDate = useCpfStore(selectLatestIncomeCeilingDate);
  const currentCeiling = CPF_INCOME_CEILING[latestIncomeCeilingDate];
  const ceilingIncrease = currentCeiling - CPF_INCOME_CEILING_BEFORE_SEPT_2023;

  const formattedDate = new Date(latestIncomeCeilingDate).toLocaleDateString(
    "en-SG",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="sticky top-16 z-40 overflow-hidden">
      {/* Gradient background - Slate */}
      <div className="relative bg-primary py-4">
        {/* Subtle teal accent line at top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />

        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-2 md:flex-row md:gap-6">
            {/* Label */}
            <span className="font-medium text-primary-foreground/80 text-sm uppercase tracking-wider">
              Your CPF Income Ceiling
            </span>

            {/* Divider - Teal dot */}
            <span className="hidden size-1.5 rounded-full bg-accent md:block" />

            {/* Value - Large number */}
            <span className="font-bold font-mono text-2xl text-primary-foreground">
              {formatCurrency(useAnimatedNumber(currentCeiling))}
            </span>

            {/* Divider */}
            <span className="hidden size-1.5 rounded-full bg-accent/50 md:block" />

            {/* Effective date */}
            <span className="text-primary-foreground/70 text-sm">
              Effective from {formattedDate}
            </span>

            {/* Increase amount - only show if ceiling has risen */}
            {ceilingIncrease > 0 && (
              <>
                <span className="hidden size-1.5 rounded-full bg-accent/50 md:block" />
                <span className="font-medium text-accent text-sm">
                  +{formatCurrency(ceilingIncrease, 0)} from pre-2023
                </span>
              </>
            )}
          </div>
        </div>

        {/* Subtle teal accent line at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      </div>
    </div>
  );
};

export default Banner;
