"use client";

import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import posthog from "posthog-js";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HeroSection = () => {
  return (
    <section className="text-center" aria-labelledby="hero-heading">
      <h1
        id="hero-heading"
        className="mb-4 font-bold text-3xl text-foreground tracking-tight md:text-4xl"
      >
        Know Exactly Where Your CPF Money Goes
      </h1>
      <p className="mx-auto mb-2 max-w-2xl text-lg text-muted-foreground">
        Find out exactly how much goes into each CPF account — your Ordinary,
        Special, and MediSave — and what your employer contributes on top. All
        based on your income and age group, in seconds.
      </p>
      <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
        See how the Budget 2023 income ceiling changes affect your take-home pay
        as the CPF ceiling rose from{" "}
        <span className="font-mono font-semibold text-accent">$6,000</span> to{" "}
        <span className="font-mono font-semibold text-accent">$8,000</span> in
        January 2026.
      </p>
      <div className="mb-6 flex items-center justify-center gap-4 text-muted-foreground text-sm">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block size-1.5 rounded-full bg-accent"
            aria-hidden="true"
          />{" "}
          Free
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block size-1.5 rounded-full bg-accent"
            aria-hidden="true"
          />{" "}
          No sign-up
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block size-1.5 rounded-full bg-accent"
            aria-hidden="true"
          />{" "}
          Open-source
        </span>
      </div>
      <Link
        href="/calculator"
        className={cn(buttonVariants({ size: "lg" }), "gap-2")}
        onClick={() =>
          posthog.capture("hero_cta_clicked", { source: "home_hero" })
        }
      >
        Calculate My CPF
        <HugeiconsIcon
          icon={ArrowRight02Icon}
          className="size-4"
          aria-hidden="true"
        />
      </Link>
    </section>
  );
};

export default HeroSection;
