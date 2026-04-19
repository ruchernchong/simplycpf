"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

type CpfLifePlan = "standard" | "escalating" | "basic" | "defer-to-70";

const defaultAge = 65;
const defaultRaBalance = 220_400;

function parseNumericInput(value: string): number {
  return Number.parseFloat(value) || 0;
}

const planOptions: { label: string; value: CpfLifePlan }[] = [
  { label: "Standard", value: "standard" },
  { label: "Escalating", value: "escalating" },
  { label: "Basic", value: "basic" },
  { label: "Defer to 70", value: "defer-to-70" },
];

export default function CpfLifeContent() {
  const [age, setAge] = useState(defaultAge);
  const [raBalance, setRaBalance] = useState(defaultRaBalance);
  const [selectedPlan, setSelectedPlan] = useState<CpfLifePlan>("standard");

  const estimate = estimateCpfLife(raBalance, age);
  const currentYear = new Date().getFullYear();
  const retirementSums = getRetirementSumsForYear(currentYear);

  const selectedPayout =
    selectedPlan === "standard"
      ? estimate.standardMonthly
      : selectedPlan === "escalating"
        ? estimate.escalatingStartMonthly
        : selectedPlan === "basic"
          ? estimate.basicMonthly
          : estimate.deferredTo70Monthly;

  const payoutCards = [
    {
      label: "Standard plan",
      value: estimate.standardMonthly,
      description: "Higher starting payout based on the current RA balance.",
    },
    {
      label: "Escalating plan",
      value: estimate.escalatingStartMonthly,
      description: "Starts lower, then grows over time.",
    },
    {
      label: "Basic plan",
      value: estimate.basicMonthly,
      description: "Lower monthly payout with more money left in RA early on.",
    },
    {
      label: "If you defer to age 70",
      value: estimate.deferredTo70Monthly,
      description:
        "Uses the simplified deferment uplift based on your current age.",
    },
  ];

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>CPF LIFE Inputs</CardTitle>
          <CardDescription>
            Enter your Retirement Account balance and age to estimate CPF LIFE
            payouts.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
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
            <Label htmlFor="cpf-life-plan">Focus plan</Label>
            <Select
              items={planOptions}
              value={selectedPlan}
              onValueChange={(value) => {
                setSelectedPlan(value as CpfLifePlan);
              }}
            >
              <SelectTrigger id="cpf-life-plan" className="w-full rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {planOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-muted-foreground text-sm">
              These are simplified estimates for planning and comparison.
              Official CPF LIFE payouts can differ.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardDescription>
              Estimated payout for the{" "}
              {planOptions
                .find((plan) => plan.value === selectedPlan)
                ?.label.toLowerCase()}{" "}
              plan
            </CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(selectedPayout, 0)}
              <span className="pl-2 font-normal text-muted-foreground text-sm">
                per month
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {age < 65
              ? `This estimate assumes payouts start from age 65. If you defer further, the defer-to-70 figure uses only the remaining years available to defer.`
              : `This estimate is based on your current age of ${age} and the RA balance entered above.`}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {payoutCards.map((card) => (
            <Card key={card.label} className="shadow-md">
              <CardHeader>
                <CardDescription>{card.label}</CardDescription>
                <CardTitle>
                  {formatCurrency(card.value, 0)}
                  <span className="pl-2 font-normal text-muted-foreground text-sm">
                    per month
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                {card.description}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>{currentYear} retirement sums</CardTitle>
            <CardDescription>
              Reference checkpoints for comparing your RA balance.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                BRS
              </p>
              <p className="font-semibold text-xl">
                {formatCurrency(retirementSums.brs, 0)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                FRS
              </p>
              <p className="font-semibold text-xl">
                {formatCurrency(retirementSums.frs, 0)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                ERS
              </p>
              <p className="font-semibold text-xl">
                {formatCurrency(retirementSums.ers, 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>How to read this estimate</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-muted-foreground text-sm">
            <p>
              SimplyCPF uses a simplified payout factor to estimate CPF LIFE
              from your Retirement Account balance.
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-6">
              <li>Standard, Escalating, and Basic are shown side by side.</li>
              <li>Defer-to-70 adjusts the uplift based on your current age.</li>
              <li>
                Balances below S$60,000 are treated as below the current
                simplified estimate threshold.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
