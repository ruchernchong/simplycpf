"use client";

import {
  ArrowRight01Icon,
  Calculator01Icon,
  ChartUpIcon,
  Exchange01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import Link from "next/link";
import posthog from "posthog-js";

type Action = {
  title: string;
  description: string;
  href: Route;
  icon: IconSvgElement;
  event: string;
};

const actions: Action[] = [
  {
    title: "Calculate contributions",
    description: "Monthly breakdown by OA / SA / MA",
    href: "/calculator",
    icon: Calculator01Icon as IconSvgElement,
    event: "navigation_click_calculator",
  },
  {
    title: "Project career savings",
    description: "Long-term balances until age 65+",
    href: "/projection" as Route,
    icon: ChartUpIcon as IconSvgElement,
    event: "navigation_click_projection",
  },
  {
    title: "Compare what-if scenarios",
    description: "Top-ups, housing, voluntary transfers",
    href: "/what-if" as Route,
    icon: Exchange01Icon as IconSvgElement,
    event: "navigation_click_what_if",
  },
  {
    title: "Estimate CPF LIFE payouts",
    description: "Monthly retirement income",
    href: "/cpf-life" as Route,
    icon: Wallet01Icon as IconSvgElement,
    event: "navigation_click_cpf_life",
  },
];

const QuickActions = () => {
  return (
    <section
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-sm"
      aria-labelledby="quick-actions-heading"
    >
      <h2
        id="quick-actions-heading"
        className="font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.1em]"
      >
        Quick Actions
      </h2>
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:border-accent/40 hover:bg-accent/5"
          onClick={() =>
            posthog.capture(action.event, { source: "home_quick_actions" })
          }
        >
          <HugeiconsIcon
            icon={action.icon}
            className="size-[18px] flex-shrink-0 text-accent"
            strokeWidth={2}
            aria-hidden="true"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="font-semibold text-[13px] text-foreground">
              {action.title}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {action.description}
            </span>
          </div>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="size-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-accent"
            strokeWidth={2}
            aria-hidden="true"
          />
        </Link>
      ))}
    </section>
  );
};

export default QuickActions;
