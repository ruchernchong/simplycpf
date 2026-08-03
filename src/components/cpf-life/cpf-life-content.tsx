"use client";

import {
  Card,
  Chip,
  cn,
  Label,
  Link,
  NumberField,
  Separator,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@heroui/react";
import { BarChart } from "@heroui-pro/react";
import { type Key, useEffect, useMemo, useState } from "react";
import { shallow } from "zustand/shallow";
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
const CUSTOM_KEY = "custom";
const MIN_RA = 0;
const MAX_RA = 2_000_000;

function firstKey(keys: Set<Key>): string | undefined {
  const [key] = [...keys];
  return key === undefined ? undefined : String(key);
}

function monthly(value: number): string {
  return formatCurrency(value, 0);
}

interface PlanBarsProps {
  values: number[];
  max: number;
  fill: string;
  label: string;
}

function PlanBars({ values, max, fill, label }: PlanBarsProps) {
  const data = [
    { age: "65", payout: values[0] ?? 0 },
    { age: "75", payout: values[1] ?? 0 },
    { age: "85", payout: values[2] ?? 0 },
  ];

  return (
    <BarChart
      aria-label={`${label} payout at ages 65, 75, and 85`}
      data={data}
      height={64}
      margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
    >
      <BarChart.XAxis dataKey="age" hide />
      <BarChart.YAxis domain={[0, max]} hide />
      <BarChart.Bar dataKey="payout" fill={fill} radius={[4, 4, 0, 0]} />
    </BarChart>
  );
}

export function CpfLifeContent() {
  const [mounted, setMounted] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [customRa, setCustomRa] = useState(DEFAULT_RA);

  useEffect(() => setMounted(true), []);

  const formStep = useCpfStore(selectFormStep);
  const projectionInputs = useCpfStore(selectProjectionInputs, shallow);

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

  let raBalance: number;
  if (activeKey === PROJECTION_KEY) {
    raBalance = projectedRa65;
  } else if (activeKey === CUSTOM_KEY) {
    raBalance = customRa;
  } else {
    raBalance = Number(activeKey);
  }

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
      fill: "var(--chart-1)",
      value: standard,
      suffix: "/month, flat",
      bars: [standard, standard, standard],
      ages: ["65", "75", "85"],
      body: "The same amount every month for life. Because it does not increase, its purchasing power falls as prices rise.",
    },
    {
      name: "Escalating",
      swatch: "bg-chart-2",
      fill: "var(--chart-2)",
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
      fill: "var(--chart-3)",
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
              <NumberField
                aria-label="Your own Retirement Account balance at 65"
                className="w-44"
                formatOptions={{
                  style: "currency",
                  currency: "SGD",
                  currencyDisplay: "narrowSymbol",
                  maximumFractionDigits: 0,
                }}
                maxValue={MAX_RA}
                minValue={MIN_RA}
                onChange={(value) => {
                  const next = Number.isNaN(value) ? MIN_RA : value;
                  setCustomRa(Math.min(Math.max(next, MIN_RA), MAX_RA));
                  setSelectedKey(CUSTOM_KEY);
                }}
                value={raBalance}
              >
                <NumberField.Group className="w-full grid-cols-1">
                  <NumberField.Input className="w-full" />
                </NumberField.Group>
              </NumberField>
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

          <Typography className="max-w-[64ch] text-[19px] leading-relaxed">
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
              <Card.Title className="font-semibold text-base tracking-tight">
                {plan.name}
              </Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <p className="flex items-baseline gap-2">
                <span className="font-semibold text-[32px] leading-none tracking-tight">
                  {monthly(plan.value)}
                </span>
                <span className="text-muted text-xs">{plan.suffix}</span>
              </p>
              <PlanBars
                fill={plan.fill}
                label={plan.name}
                max={maxBar}
                values={plan.bars}
              />
              <div className="flex items-baseline justify-between gap-2 font-mono text-[10.5px] text-muted">
                {plan.ages.map((age) => (
                  <span key={age}>{age}</span>
                ))}
              </div>
              <p className="text-[12.5px] leading-relaxed">{plan.body}</p>
            </Card.Content>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title className="font-semibold text-base tracking-tight">
              Starting later instead
            </Card.Title>
            <Card.Description>
              Payouts can begin any time between 65 and 70. Each year deferred
              raises the monthly amount permanently.
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            {deferralRows.map((row) => (
              <div className="flex items-baseline gap-4" key={row.age}>
                <span className="w-8 font-mono text-[10.5px] text-muted tracking-[0.12em]">
                  {row.age}
                </span>
                <span
                  className={cn(
                    "w-28 font-semibold text-xl tracking-tight",
                    row.accent && "text-accent",
                  )}
                >
                  {row.value}
                </span>
                <span className="flex-1 text-[12.5px] text-muted leading-relaxed">
                  {row.note}
                </span>
              </div>
            ))}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title className="font-semibold text-base tracking-tight">
              How these numbers were produced
            </Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            <ol className="flex flex-col gap-4">
              {method.map((item, index) => (
                <li className="flex gap-2" key={item}>
                  <span className="font-mono text-[10.5px] text-muted tracking-[0.12em]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[12.5px] leading-relaxed">{item}</span>
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
