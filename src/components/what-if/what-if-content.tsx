"use client";

import {
  Card,
  Chip,
  Label,
  Link,
  NumberField,
  Separator,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@heroui/react";
import { EmptyState } from "@heroui-pro/react";
import {
  parseAsInteger,
  parseAsStringLiteral,
  useQueryState,
  useQueryStates,
} from "nuqs";
import { Fragment, useEffect, useMemo, useState } from "react";
import type { Key } from "react-aria-components";
import { Eyebrow } from "@/components/shared/section-header";
import { useCpfStore } from "@/hooks/use-cpf-store";
import { estimateCpfLife } from "@/lib/calculate-cpf-projection";
import {
  calculateAgeComparisonScenario,
  calculateOaToSaScenario,
  calculateSalaryChangeScenario,
  calculateVoluntaryTopUpScenario,
} from "@/lib/calculate-what-if";
import { formatCurrency } from "@/lib/format";
import {
  selectAge,
  selectBirthDate,
  selectCitizenshipStatus,
  selectFormStep,
  selectMonthlyGrossIncome,
} from "@/stores/selectors";
import type {
  AccountBalances,
  ProjectionResult,
  ScenarioResult,
} from "@/types";

const scenarioKeys = ["topup", "oasa", "salary", "later"] as const;

type ScenarioKey = (typeof scenarioKeys)[number];

const scenarioChips: { key: ScenarioKey; label: string }[] = [
  { key: "topup", label: "Yearly top-up to SA" },
  { key: "oasa", label: "One-off OA → SA transfer" },
  { key: "salary", label: "Higher salary" },
  { key: "later", label: "Start later" },
];

const scenarioColumnLabels: Record<ScenarioKey, string> = {
  topup: "with a yearly SA top-up",
  oasa: "with an OA to SA transfer",
  salary: "on a higher salary",
  later: "starting later",
};

const TOP_UP_AMOUNT = 5_000;
const OA_TO_SA_AMOUNT = 30_000;
const SALARY_DELTA = 1_000;
const YEARS_LATER = 5;

/*
 * Each scenario turns on one number. They were fixed at the values above,
 * which answered the question only for whoever happened to be topping up
 * exactly $5,000 a year, so each is now an input carried in the URL.
 */
const scenarioInputs = {
  topup: {
    param: "topup",
    label: "Added to SA each year",
    min: 0,
    max: 50_000,
    isCurrency: true,
  },
  oasa: {
    param: "transfer",
    label: "Moved from OA to SA",
    min: 0,
    max: 500_000,
    isCurrency: true,
  },
  salary: {
    param: "raise",
    label: "Monthly increase",
    min: 0,
    max: 50_000,
    isCurrency: true,
  },
  later: {
    param: "delay",
    label: "Years later you start",
    min: 1,
    max: 20,
    isCurrency: false,
  },
} as const;

const currencyFormat = {
  style: "currency",
  currency: "SGD",
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
} as const;
const END_AGE = 65;

const MONO_LABEL = "font-mono text-[10px] uppercase tracking-[0.12em]";

const assumptions = [
  "Salary held flat, no raises, no gaps in employment, no bonuses.",
  "OA 2.50%, SA / MA / RA 4.00%, plus 1% on the first $60,000 combined.",
  "No OA used for housing, and the MediSave Basic Healthcare Sum cap is not modelled.",
  "Interest compounded yearly; contribution rates as published for 1 January 2026.",
];

interface ComparisonRow {
  label: string;
  baseline: number;
  scenario: number;
  isAccent?: boolean;
}

function balancesAt65(result: ProjectionResult): AccountBalances {
  const milestone = result.milestones.age65;
  const total = milestone.oa + milestone.sa + milestone.ma + milestone.ra;

  if (total > 0) {
    return milestone;
  }

  return (
    result.yearlyBalances.at(-1)?.balances ?? { oa: 0, sa: 0, ma: 0, ra: 0 }
  );
}

function buildRows(
  baseline: ProjectionResult,
  scenario: ProjectionResult,
): ComparisonRow[] {
  const baselineAt65 = balancesAt65(baseline);
  const scenarioAt65 = balancesAt65(scenario);

  const baselineTotal =
    baselineAt65.oa + baselineAt65.sa + baselineAt65.ma + baselineAt65.ra;
  const scenarioTotal =
    scenarioAt65.oa + scenarioAt65.sa + scenarioAt65.ma + scenarioAt65.ra;

  return [
    {
      label: "Total contributed to 65",
      baseline: baseline.totalContributed,
      scenario: scenario.totalContributed,
    },
    {
      label: "Interest earned",
      baseline: baseline.totalInterestEarned,
      scenario: scenario.totalInterestEarned,
    },
    {
      label: "All accounts at 65",
      baseline: baselineTotal,
      scenario: scenarioTotal,
    },
    {
      label: "Retirement Account at 65",
      baseline: baselineAt65.ra,
      scenario: scenarioAt65.ra,
    },
    {
      label: "CPF LIFE Standard, monthly",
      baseline: estimateCpfLife(baselineAt65.ra).standardMonthly,
      scenario: estimateCpfLife(scenarioAt65.ra).standardMonthly,
      isAccent: true,
    },
  ];
}

function formatDelta(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "+";

  return `${sign}${formatCurrency(Math.abs(rounded), 0)}`;
}

interface ValueRowProps {
  label: string;
  value: number;
  delta?: number;
  isAccent?: boolean;
}

function ValueRow({ label, value, delta, isAccent }: ValueRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <span className="text-muted text-sm">{label}</span>
      <span className="flex items-baseline gap-2">
        {delta !== undefined && (
          <span
            className={isAccent ? "text-accent text-xs" : "text-muted text-xs"}
          >
            {formatDelta(delta)}
          </span>
        )}
        <span className="font-semibold text-sm">
          {formatCurrency(value, 0)}
        </span>
      </span>
    </div>
  );
}

interface ColumnCardProps {
  title: string;
  tag: string;
  rows: ComparisonRow[];
  isScenario?: boolean;
}

function ColumnCard({ title, tag, rows, isScenario }: ColumnCardProps) {
  return (
    <Card className={isScenario ? "border-accent/30" : undefined}>
      <Card.Header className="flex flex-row items-center justify-between gap-4">
        <Card.Title className="text-base">{title}</Card.Title>
        <Chip size="sm" color={isScenario ? "accent" : "default"}>
          <Chip.Label className={MONO_LABEL}>{tag}</Chip.Label>
        </Chip>
      </Card.Header>
      <Card.Content className="flex flex-col">
        {rows.map((row, index) => (
          <Fragment key={row.label}>
            {index > 0 && <Separator />}
            <ValueRow
              label={row.label}
              value={isScenario ? row.scenario : row.baseline}
              delta={isScenario ? row.scenario - row.baseline : undefined}
              isAccent={row.isAccent}
            />
          </Fragment>
        ))}
      </Card.Content>
    </Card>
  );
}

function ComparisonEmptyState() {
  return (
    <EmptyState>
      <EmptyState.Header>
        <EmptyState.Title>Enter your salary and date of birth</EmptyState.Title>
        <EmptyState.Description>
          The comparison runs on your own numbers. Add them on the home page and
          this screen fills in.
        </EmptyState.Description>
      </EmptyState.Header>
      <EmptyState.Content>
        <Link href="/">Go to the home page</Link>
      </EmptyState.Content>
    </EmptyState>
  );
}

function ComparisonSkeleton() {
  return <Skeleton className="h-96 w-full rounded-lg" />;
}

function AssumptionsCard() {
  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-base">What both columns assume</Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {assumptions.map((assumption, index) => (
            <div key={assumption} className="flex gap-4">
              <span className={`${MONO_LABEL} text-muted`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="max-w-[64ch]">
                <Typography color="muted" type="body-sm">
                  {assumption}
                </Typography>
              </div>
            </div>
          ))}
        </div>
        <Separator />
        <div className="max-w-[64ch]">
          <Typography color="muted" type="body-sm">
            A projection is a calculation about assumptions, not a forecast
            about you. Estimates only, not financial advice.
          </Typography>
        </div>
      </Card.Content>
    </Card>
  );
}

export default function WhatIfContent() {
  const [scenario, setScenario] = useQueryState(
    "scenario",
    parseAsStringLiteral(scenarioKeys).withDefault("topup"),
  );
  const [amounts, setAmounts] = useQueryStates(
    {
      topup: parseAsInteger.withDefault(TOP_UP_AMOUNT),
      transfer: parseAsInteger.withDefault(OA_TO_SA_AMOUNT),
      raise: parseAsInteger.withDefault(SALARY_DELTA),
      delay: parseAsInteger.withDefault(YEARS_LATER),
    },
    { history: "replace" },
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const input = scenarioInputs[scenario];
  const clampInput = (value: number) =>
    Number.isNaN(value)
      ? input.min
      : Math.min(Math.max(Math.round(value), input.min), input.max);

  const topUpAmount = Math.min(
    Math.max(amounts.topup, scenarioInputs.topup.min),
    scenarioInputs.topup.max,
  );
  const transferAmount = Math.min(
    Math.max(amounts.transfer, scenarioInputs.oasa.min),
    scenarioInputs.oasa.max,
  );
  const salaryDelta = Math.min(
    Math.max(amounts.raise, scenarioInputs.salary.min),
    scenarioInputs.salary.max,
  );
  const yearsLater = Math.min(
    Math.max(amounts.delay, scenarioInputs.later.min),
    scenarioInputs.later.max,
  );

  const formStep = useCpfStore(selectFormStep);
  const age = useCpfStore(selectAge);
  const monthlyIncome = useCpfStore(selectMonthlyGrossIncome);
  const birthDate = useCpfStore(selectBirthDate);
  const citizenshipStatus = useCpfStore(selectCitizenshipStatus);

  const result: ScenarioResult | null = useMemo(() => {
    if (formStep < 2) {
      return null;
    }

    const projection = {
      monthlyIncome,
      birthDate,
      endAge: END_AGE,
      citizenship: citizenshipStatus,
    };

    switch (scenario) {
      case "topup":
        return calculateVoluntaryTopUpScenario({
          projection,
          amount: topUpAmount,
          account: "SA",
          frequency: "yearly",
        });
      case "oasa":
        return calculateOaToSaScenario({
          projection,
          transferAmount,
          timing: "now",
        });
      case "salary":
        return calculateSalaryChangeScenario({
          projection,
          newMonthlyIncome: monthlyIncome + salaryDelta,
        });
      default:
        return calculateAgeComparisonScenario({
          monthlyIncome,
          endAge: END_AGE,
          citizenship: citizenshipStatus,
          baselineStartAge: age,
          scenarioStartAge: age + yearsLater,
        });
    }
  }, [
    formStep,
    monthlyIncome,
    birthDate,
    citizenshipStatus,
    scenario,
    age,
    topUpAmount,
    transferAmount,
    salaryDelta,
    yearsLater,
  ]);

  const descriptions: Record<ScenarioKey, string> = {
    topup: `${formatCurrency(topUpAmount, 0)} added to your Special Account every year until 55, on top of mandatory contributions.`,
    oasa: `${formatCurrency(transferAmount, 0)} moved from OA to SA once, this year. Irreversible: SA savings cannot be used for housing.`,
    salary: `${formatCurrency(monthlyIncome + salaryDelta, 0)} a month instead of ${formatCurrency(monthlyIncome, 0)}, held flat to 65.`,
    later: `First contribution at age ${age + yearsLater} instead of ${age}, ${yearsLater} fewer ${yearsLater === 1 ? "year" : "years"} of contributions and compounding.`,
  };

  const rows = result ? buildRows(result.baseline, result.scenario) : [];

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <Eyebrow color="muted">Compare</Eyebrow>
        <Typography type="h1">Two sets of assumptions, side by side</Typography>
        <div className="max-w-[76ch]">
          <Typography color="muted">
            Change one thing and see what the arithmetic does. This tool states
            differences; it does not suggest which column you should prefer.
          </Typography>
        </div>
      </header>

      <Card>
        <Card.Header>
          <span className={`${MONO_LABEL} text-muted`}>
            Change one assumption
          </span>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <ToggleButtonGroup
            isDetached
            disallowEmptySelection
            selectionMode="single"
            size="sm"
            selectedKeys={new Set<Key>([scenario])}
            onSelectionChange={(keys) => {
              const [next] = [...keys];
              const match = scenarioKeys.find((key) => key === next);
              if (match) {
                void setScenario(match);
              }
            }}
            className="flex-wrap"
          >
            {scenarioChips.map(({ key, label }) => (
              <ToggleButton key={key} id={key}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <NumberField
            className="flex max-w-56 flex-col gap-2"
            formatOptions={input.isCurrency ? currencyFormat : undefined}
            key={input.param}
            maxValue={input.max}
            minValue={input.min}
            onChange={(value) =>
              void setAmounts({ [input.param]: clampInput(value) })
            }
            value={amounts[input.param]}
          >
            <Label>{input.label}</Label>
            <NumberField.Group className="w-full grid-cols-1">
              <NumberField.Input className="w-full" />
            </NumberField.Group>
          </NumberField>
          <div className="max-w-[64ch]">
            <Typography color="muted" type="body-xs">
              {mounted ? descriptions[scenario] : null}
            </Typography>
          </div>
        </Card.Content>
      </Card>

      {!mounted ? (
        <ComparisonSkeleton />
      ) : result === null ? (
        <ComparisonEmptyState />
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          <ColumnCard
            title="Column A · as you are now"
            tag="Baseline"
            rows={rows}
          />
          <ColumnCard
            isScenario
            title={`Column B · ${scenarioColumnLabels[scenario]}`}
            tag="Scenario"
            rows={rows}
          />
        </div>
      )}

      <AssumptionsCard />
    </div>
  );
}
