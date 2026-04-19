"use client";

import {
  ArrowDataTransferHorizontalIcon,
  Calendar01Icon,
  Coins01Icon,
  PiggyBankIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type ScenarioType = "salary" | "transfer" | "top-up" | "age-comparison";

const scenarioOptions: {
  label: string;
  description: string;
  icon: IconSvgElement;
  value: ScenarioType;
}[] = [
  {
    label: "Top-Up",
    description: "Forecast yearly cash top-ups over time.",
    icon: PiggyBankIcon as IconSvgElement,
    value: "top-up",
  },
  {
    label: "OA to SA Transfer",
    description: "Model whether moving OA boosts retirement.",
    icon: ArrowDataTransferHorizontalIcon as IconSvgElement,
    value: "transfer",
  },
  {
    label: "Age Comparison",
    description: "Compare starting today vs starting later.",
    icon: Calendar01Icon as IconSvgElement,
    value: "age-comparison",
  },
  {
    label: "Salary Change",
    description: "Model how your next pay move shifts CPF.",
    icon: Coins01Icon as IconSvgElement,
    value: "salary",
  },
];

export function isScenarioType(value: string | null): value is ScenarioType {
  return scenarioOptions.some((option) => option.value === value);
}

interface ScenarioSelectorProps {
  active: ScenarioType;
}

export default function ScenarioSelector({ active }: ScenarioSelectorProps) {
  return (
    <TabsList
      variant="line"
      className="grid h-auto w-full grid-cols-2 gap-2 border-none bg-transparent p-0 lg:grid-cols-4"
    >
      {scenarioOptions.map((option) => {
        const isActive = option.value === active;
        return (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className={cn(
              "flex h-auto flex-col items-start gap-1 rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-colors data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
            )}
          >
            <span className="flex items-center gap-2">
              <HugeiconsIcon
                icon={option.icon}
                className={cn(
                  "size-4",
                  isActive ? "text-accent" : "text-muted-foreground",
                )}
                strokeWidth={2}
              />
              <span className="font-semibold text-[13px]">{option.label}</span>
            </span>
            <span
              className={cn(
                "text-[11px] leading-[1.4]",
                isActive ? "opacity-80" : "text-muted-foreground",
              )}
            >
              {option.description}
            </span>
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
}
