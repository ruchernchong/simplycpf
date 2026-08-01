"use client";

import {
  Card,
  Chip,
  cn,
  Label,
  Link,
  Separator,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@heroui/react";
import { type Key, useEffect, useMemo, useState } from "react";
import { useCpfStore } from "@/hooks/use-cpf-store";
import {
  calculateCpfProjection,
  estimateCpfLife,
} from "@/lib/calculate-cpf-projection";
import { formatCurrency } from "@/lib/format";
import { selectFormStep, selectProjectionInputs } from "@/stores/selectors";

/** Mirrors CPF_LIFE_DEFER_ANNUAL_INCREASE in calculate-cpf-projection.ts. */
const DEFER_ANNUAL_INCREASE = 0.07;
const ESCALATION_RATE = 0.02;

const RA_OPTIONS = [200_000, 400_000, 600_000] as const;
const DEFAULT_RA = 400_000;
const PROJECTION_KEY = "projection";

function firstKey(keys: Set<Key>): string | undefined {
  const [key] = [...keys];
  return key === undefined ? undefined : String(key);
}

function monthly(value: number): string {
  return formatCurrency(value, 0);
}

interface MiniBarsProps {
  values: number[];
  max: number;
  color: string;
}

function MiniBars({ values, max, color }: MiniBarsProps) {
  return (
    <div aria-hidden className="flex h-16 items-end gap-2">
      {values.map((value, index) => (
        <div
          className={cn("flex-1 rounded-t-sm", color)}
          // biome-ignore lint/suspicious/noArrayIndexKey: bars are positional (65/75/85)
          key={index}
          style={{ height: `${Math.max(8, (value / max) * 64)}px` }}
        />
      ))}
    </div>
  );
}

export function CpfLifeContent() {
  const [mounted, setMounted] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const formStep = useCpfStore(selectFormStep);
  const projectionInputs = useCpfStore(selectProjectionInputs);

  const hasProjection = mounted && formStep >= 2;

  const projectedRa65 = useMemo(() => {
    if (!hasProjection) return 0;
    const projection = calculateCpfProjection({
      monthlyIncome: projectionInputs.monthlyIncome,
      birthDate: projectionInputs.birthDate,
      endAge: 65,
      citizenship: projectionInputs.citizenshipStatus,
    });
    return Math.round(projection.milestones.age65.ra);
  }, [
    hasProjection,
    projectionInputs.monthlyIncome,
    projectionInputs.birthDate,
    projectionInputs.citizenshipStatus,
  ]);

  const activeKey =
    selectedKey ??
    (hasProjection && projectedRa65 > 0 ? PROJECTION_KEY : String(DEFAULT_RA));

  const raBalance =
    activeKey === PROJECTION_KEY ? projectedRa65 : Number(activeKey);

  const estimate = estimateCpfLife(raBalance, 65);
  const standard = estimate.standardMonthly;
  const escalating = estimate.escalatingStartMonthly;
  const basic = estimate.basicMonthly;

  const escalating75 = Math.round(escalating * (1 + ESCALATION_RATE) ** 10);
  const escalating85 = Math.round(escalating * (1 + ESCALATION_RATE) ** 20);
  const basic85 = Math.round(basic * 0.85);

  const standard68 = Math.round(standard * (1 + DEFER_ANNUAL_INCREASE * 3));
  const standard70 = estimate.deferredTo70Monthly;

  const maxBar = Math.max(standard, escalating85, basic, 1);

  const plans = [
    {
      name: "Standard",
      swatch: "bg-chart-1",
      value: standard,
      suffix: "/month, flat",
      bars: [standard, standard, standard],
      ages: ["65", "75", "85"],
      body: "The same amount every month for life. Because it does not increase, its purchasing power falls as prices rise.",
    },
    {
      name: "Escalating",
      swatch: "bg-chart-2",
      value: escalating,
      suffix: "/month, +2% a year",
      bars: [escalating, escalating75, escalating85],
      ages: [
        "65",
        `75 · ${monthly(escalating75)}`,
        `85 · ${monthly(escalating85)}`,
      ],
      body: "Starts lower, rises 2% every year to keep pace with prices. Crosses the Standard payout in the mid-seventies.",
    },
    {
      name: "Basic",
      swatch: "bg-chart-3",
      value: basic,
      suffix: "/month, can fall",
      bars: [basic, basic, basic85],
      ages: ["65", "75", "85"],
      body: "Lowest starting payout, and it steps down once combined balances fall below $60,000. A larger bequest is not guaranteed.",
    },
  ];

  const deferralRows = [
    {
      age: "65",
      value: monthly(standard),
      note: "Standard, starting at eligibility age",
      accent: false,
    },
    {
      age: "68",
      value: monthly(standard68),
      note: "Three years of extra interest and a shorter horizon",
      accent: false,
    },
    {
      age: "70",
      value: monthly(standard70),
      note: "The latest start permitted",
      accent: true,
    },
  ];

  const method = [
    "Scaled from CPF's published anchor: an Enhanced Retirement Sum set aside at 55 in 2025 corresponds to payouts of about $3,300 a month from 65.",
    "Escalating shown at roughly four-fifths of Standard at 65, then compounding 2% a year.",
    "Actual payouts depend on your cohort, sex, and the CPF LIFE parameters at the time.",
  ];

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <Card.Content className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <Label>Retirement Account at 65</Label>
              <ToggleButtonGroup
                aria-label="Retirement Account at 65"
                disallowEmptySelection
                selectedKeys={[activeKey]}
                selectionMode="single"
                size="sm"
                onSelectionChange={(keys) => {
                  const key = firstKey(keys);
                  if (key) setSelectedKey(key);
                }}
              >
                <ToggleButton
                  id={PROJECTION_KEY}
                  isDisabled={!hasProjection || projectedRa65 <= 0}
                >
                  {hasProjection && projectedRa65 > 0
                    ? `Your projection · ${monthly(projectedRa65)}`
                    : "Your projection"}
                </ToggleButton>
                {RA_OPTIONS.map((option) => (
                  <ToggleButton id={String(option)} key={option}>
                    {`$${option / 1000}k`}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>
            <Chip size="sm" variant="soft">
              Payouts estimated from published CPF anchor figures
            </Chip>
          </div>

          {!hasProjection && (
            <Typography color="muted" type="body-xs">
              Enter salary and DOB on the <Link href="/">home page</Link> to use
              your own projection.
            </Typography>
          )}

          <Typography className="max-w-[64ch]">
            A Retirement Account of {monthly(raBalance)} at 65 supports roughly{" "}
            {monthly(standard)} a month on the Standard plan,{" "}
            {monthly(escalating)} rising 2% a year on Escalating, or{" "}
            {monthly(basic)} on Basic. Over twenty years the Escalating payout
            reaches {monthly(escalating85)}.
          </Typography>
        </Card.Content>
      </Card>

      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name}>
            <Card.Header className="flex-row items-center gap-2">
              <span
                aria-hidden
                className={cn("size-2 rounded-full", plan.swatch)}
              />
              <Card.Title>{plan.name}</Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <div className="flex items-baseline gap-2">
                <Typography type="h2">{monthly(plan.value)}</Typography>
                <Typography color="muted" type="body-xs">
                  {plan.suffix}
                </Typography>
              </div>
              <MiniBars color={plan.swatch} max={maxBar} values={plan.bars} />
              <div className="flex items-baseline justify-between gap-2">
                {plan.ages.map((age) => (
                  <Typography color="muted" key={age} type="body-xs">
                    {age}
                  </Typography>
                ))}
              </div>
              <Typography type="body-sm">{plan.body}</Typography>
            </Card.Content>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title>Starting later instead</Card.Title>
            <Card.Description>
              Payouts can begin any time between 65 and 70. Each year deferred
              raises the monthly amount permanently.
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            {deferralRows.map((row) => (
              <div className="flex items-baseline gap-4" key={row.age}>
                <Typography className="w-8" color="muted" type="body-xs">
                  {row.age}
                </Typography>
                <Typography
                  className={cn("w-28", row.accent && "text-accent")}
                  type="h4"
                >
                  {row.value}
                </Typography>
                <Typography className="flex-1" color="muted" type="body-sm">
                  {row.note}
                </Typography>
              </div>
            ))}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>How these numbers were produced</Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            <ol className="flex flex-col gap-3">
              {method.map((item, index) => (
                <li className="flex gap-3" key={item}>
                  <Typography color="muted" type="body-xs">
                    {String(index + 1).padStart(2, "0")}
                  </Typography>
                  <Typography type="body-sm">{item}</Typography>
                </li>
              ))}
            </ol>
            <Separator />
            <Typography color="muted" type="body-xs">
              Indicative only. Use CPF's own payout estimator for figures tied
              to your record. SimplyCPF does not recommend a plan.
            </Typography>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}

export default CpfLifeContent;
