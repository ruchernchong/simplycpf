"use client";

import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import posthog from "posthog-js";

const BreakdownCta = () => {
  return (
    <section
      aria-labelledby="breakdown-cta-heading"
      className="flex flex-col items-center gap-3 rounded-xl bg-primary px-10 py-7 text-primary-foreground"
    >
      <h2
        id="breakdown-cta-heading"
        className="max-w-[700px] text-center font-bold text-3xl leading-[1.2]"
      >
        Need a full CPF breakdown?
      </h2>
      <p className="max-w-[620px] text-center text-[16px] leading-[1.55] opacity-80">
        Use the calculator to estimate employee and employer contributions
        across OA, SA, and MA.
      </p>
      <Link
        href="/calculator"
        onClick={() =>
          posthog.capture("breakdown_cta_clicked", { source: "home_breakdown" })
        }
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-7 py-3.5 font-semibold text-[16px] text-accent-foreground shadow-sm transition-colors hover:bg-accent/90"
      >
        Open contribution breakdown
        <HugeiconsIcon
          icon={ArrowRight02Icon}
          className="size-[18px]"
          aria-hidden="true"
        />
      </Link>
    </section>
  );
};

export default BreakdownCta;
