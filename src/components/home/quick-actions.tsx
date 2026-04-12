"use client";

import {
  Calculator01Icon,
  ChartLineData01Icon,
  MoneyBag01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EVENT, type EventName, trackTypedEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const actions = [
  {
    title: "CPF Calculator",
    description:
      "See your full CPF breakdown — employee and employer contributions by age group and income, plus your take-home pay",
    href: "/calculator" as const,
    icon: Calculator01Icon as IconSvgElement,
    event: EVENT.NAVIGATION_CLICK_CALCULATOR,
  },
  {
    title: "Interest Rates",
    description:
      "Check how much interest your OA, SA, and MA earn, and see contribution distribution rates across all 8 age brackets",
    href: "/interest-rates" as const,
    icon: ChartLineData01Icon as IconSvgElement,
    event: EVENT.NAVIGATION_CLICK_INTEREST_RATES,
  },
  {
    title: "Investment Comparison",
    description:
      "Compare your CPF returns against Singapore bonds, STI ETF, and other investments to decide which strategy fits your retirement timeline",
    href: "/investments" as const,
    icon: MoneyBag01Icon as IconSvgElement,
    event: EVENT.NAVIGATION_CLICK_INVESTMENTS,
  },
];

const QuickActions = () => {
  return (
    <section>
      <h2 className="mb-4 font-semibold text-lg text-muted-foreground">
        What Would You Like to Know?
      </h2>
      <div className="grid gap-4">
        {actions.map((action, index) => (
          <Link
            key={action.href}
            href={action.href}
            className="group"
            onClick={() =>
              trackTypedEvent(action.event as EventName, {
                source: "home_quick_actions",
              })
            }
          >
            <Card
              className={cn(
                "h-full transition-all hover:shadow-md",
                index === 0
                  ? "border-accent/30 shadow-md hover:border-accent/50"
                  : "shadow-sm hover:border-accent/30",
              )}
            >
              <CardHeader className="pb-4">
                <div className="mb-2 flex items-center gap-4">
                  <div
                    className={cn(
                      "rounded-lg p-2",
                      index === 0 ? "bg-accent/15" : "bg-accent/10",
                    )}
                  >
                    <HugeiconsIcon
                      icon={action.icon}
                      className="size-5 text-accent"
                      strokeWidth={2}
                    />
                  </div>
                  <CardTitle
                    className={cn(
                      "text-base transition-colors group-hover:text-accent",
                      index === 0 && "text-lg",
                    )}
                  >
                    {action.title}
                  </CardTitle>
                  {index === 0 && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 font-medium text-accent text-xs">
                      Most Popular
                    </span>
                  )}
                </div>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
