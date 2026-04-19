"use client";

import {
  ArrowRight02Icon,
  FlashIcon,
  ShieldUserIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import posthog from "posthog-js";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const badges: { icon: IconSvgElement; label: string }[] = [
  { icon: Tick02Icon as IconSvgElement, label: "No cost" },
  { icon: ShieldUserIcon as IconSvgElement, label: "No sign-in required" },
  { icon: FlashIcon as IconSvgElement, label: "Immediate calculation" },
];

const HeroSection = () => {
  return (
    <section
      className="flex flex-col items-center gap-4 py-5 text-center"
      aria-labelledby="hero-heading"
    >
      <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 font-medium text-[12px] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
        Updated for Budget 2023 ceiling changes
      </span>
      <h1
        id="hero-heading"
        className="max-w-[760px] font-bold text-4xl text-foreground leading-[1.1] tracking-tight md:text-5xl"
      >
        CPF Contribution Overview
      </h1>
      <p className="hero-description max-w-[640px] text-[16px] text-muted-foreground leading-[1.55]">
        Review estimated monthly CPF contributions across Ordinary, Special, and
        Medisave accounts, based on applicable income ceiling values from 2023
        to 2026.
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-3">
        {badges.map(({ icon, label }) => (
          <li
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 font-medium text-[13px] text-foreground"
          >
            <HugeiconsIcon
              icon={icon}
              className="size-3.5 text-accent"
              strokeWidth={2}
              aria-hidden="true"
            />
            {label}
          </li>
        ))}
      </ul>
      <Link
        href="/calculator"
        className={cn(buttonVariants({ size: "lg" }), "gap-2")}
        onClick={() =>
          posthog.capture("hero_cta_clicked", { source: "home_hero" })
        }
      >
        Go to calculator
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
