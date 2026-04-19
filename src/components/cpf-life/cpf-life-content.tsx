"use client";

import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRetirementSumsForYear } from "@/constants/cpf-retirement-sums";
import { estimateCpfLife } from "@/lib/calculate-cpf-projection";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type CpfLifePlan = "standard" | "basic" | "escalating";

const defaultAge = 65;
const defaultRaBalance = 220_400;

function parseNumericInput(value: string): number {
  return Number.parseFloat(value) || 0;
}

const planMeta: Record<
  CpfLifePlan,
  { label: string; description: string; profile: string; eyebrow?: string }
> = {
  standard: {
    label: "Standard Plan",
    description: "Steady monthly payouts from age 65.",
    profile: "Level profile, modest bequest retention.",
  },
  basic: {
    label: "Basic Plan",
    description: "Slower payouts with larger bequest retention.",
    profile: "Conservative profile, larger funds left in RA.",
  },
  escalating: {
    label: "Escalating Plan",
    description: "Starts lower, grows about 2% yearly.",
    profile: "Inflation profile — payouts start lower and rise over time.",
    eyebrow: "New",
  },
};

function formatRange(low: number, high: number) {
  return `${formatCurrency(low, 0)} → ${formatCurrency(high, 0)}`;
}

export default function CpfLifeContent() {
  const [age, setAge] = useState(defaultAge);
  const [raBalance, setRaBalance] = useState(defaultRaBalance);
  const [highlightedPlan, setHighlightedPlan] =
    useState<CpfLifePlan>("escalating");

  const estimate = estimateCpfLife(raBalance, age);
  const currentYear = new Date().getFullYear();
  const retirementSums = getRetirementSumsForYear(currentYear);

  const planRanges: Record<CpfLifePlan, { low: number; high: number }> = {
    standard: {
      low: estimate.standardMonthly,
      high: Math.round(estimate.standardMonthly * 1.07),
    },
    basic: {
      low: estimate.basicMonthly,
      high: Math.round(estimate.basicMonthly * 1.07),
    },
    escalating: {
      low: estimate.escalatingStartMonthly,
      high: Math.round(estimate.escalatingStartMonthly * 1.7),
    },
  };

  const planOrder: CpfLifePlan[] = ["standard", "basic", "escalating"];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-2 rounded-lg bg-muted p-4">
        <HugeiconsIcon
          icon={InformationCircleIcon}
          className="size-4 flex-shrink-0 text-accent"
          strokeWidth={2}
          aria-hidden="true"
        />
        <p className="text-[13px] text-muted-foreground leading-[1.55]">
          <span className="font-semibold text-foreground">Planning note.</span>{" "}
          Figures are illustrative only. Use them to compare payout patterns,
          inflation effects, and bequest trade-offs.
        </p>
      </div>

      <section
        aria-label="CPF LIFE inputs"
        className="grid gap-4 rounded-lg border border-border bg-card p-6 shadow-sm sm:grid-cols-3"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="cpf-life-age">Current age</Label>
          <Input
            id="cpf-life-age"
            type="number"
            min={55}
            max={70}
            value={age}
            onChange={(event) =>
              setAge(
                Math.min(
                  70,
                  Math.max(55, parseNumericInput(event.target.value)),
                ),
              )
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cpf-life-ra-balance">
            Retirement Account balance
          </Label>
          <Input
            id="cpf-life-ra-balance"
            type="number"
            min={0}
            value={raBalance}
            onChange={(event) =>
              setRaBalance(parseNumericInput(event.target.value))
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cpf-life-plan">Highlight plan</Label>
          <Select
            items={planOrder.map((plan) => ({
              value: plan,
              label: planMeta[plan].label,
            }))}
            value={highlightedPlan}
            onValueChange={(value) => {
              if (value) setHighlightedPlan(value as CpfLifePlan);
            }}
          >
            <SelectTrigger id="cpf-life-plan" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {planOrder.map((plan) => (
                <SelectItem key={plan} value={plan}>
                  {planMeta[plan].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-3">
        {planOrder.map((plan) => {
          const { label, description, profile, eyebrow } = planMeta[plan];
          const range = planRanges[plan];
          const isHighlighted = plan === highlightedPlan;

          return (
            <button
              key={plan}
              type="button"
              onClick={() => setHighlightedPlan(plan)}
              className={cn(
                "flex flex-col gap-2 rounded-lg border bg-card p-5 text-left shadow-sm transition-colors",
                isHighlighted
                  ? "border-accent ring-1 ring-accent/30"
                  : "border-border hover:border-accent/50",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.1em]">
                  {plan === "escalating" ? "ESCALATING" : plan.toUpperCase()}
                </p>
                {eyebrow ? (
                  <span className="rounded-full bg-accent px-2 py-0.5 font-semibold text-[10px] text-accent-foreground uppercase tracking-wide">
                    {eyebrow}
                  </span>
                ) : null}
              </div>
              <p className="font-semibold text-[16px] text-foreground">
                {label}
              </p>
              <p className="font-bold font-mono text-[20px] text-foreground">
                {formatRange(range.low, range.high)}
              </p>
              <p className="text-[12px] text-muted-foreground">{description}</p>
              <p className="text-[12px] text-muted-foreground/80">{profile}</p>
            </button>
          );
        })}
      </div>

      <section
        aria-label="Retirement Sum reference"
        className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <h3 className="font-semibold text-[16px] text-foreground">
          Retirement Sum Reference ({currentYear})
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              {
                code: "BRS",
                label: "Basic Retirement Sum",
                value: retirementSums.brs,
                tone: "Basic Retirement Sum reference amount",
              },
              {
                code: "FRS",
                label: "Full Retirement Sum",
                value: retirementSums.frs,
                tone: "Full Retirement Sum reference amount",
              },
              {
                code: "ERS",
                label: "Enhanced Retirement Sum",
                value: retirementSums.ers,
                tone: "Enhanced Retirement Sum reference amount",
              },
            ] as const
          ).map(({ code, label, value, tone }) => (
            <div
              key={code}
              className="flex flex-col gap-1 rounded-lg border border-border bg-background p-4"
            >
              <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.1em]">
                {code}
              </p>
              <p className="font-bold font-mono text-foreground text-xl">
                {formatCurrency(value, 0)}
              </p>
              <p className="text-[12px] text-muted-foreground">{tone}</p>
              <span className="sr-only">{label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
