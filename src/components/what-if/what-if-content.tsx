"use client";

import {
  Card,
  Chip,
  Link,
  Separator,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@heroui/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Fragment, useEffect, useMemo, useState } from "react";
import type { Key } from "react-aria-components";
import { PageHeader } from "@/components/shared/section-header";
import { useCpfStore } from "@/hooks/use-cpf-store";
import {
  calculateAgeComparisonScenario,
  calculateRetirementTransferScenario,
  calculateSalaryChangeScenario,
  calculateVoluntaryTopUpScenario,
} from "@/lib/calculate-what-if";
import { formatCurrency } from "@/lib/format";
import { CPF_POLICY_CATALOGUE } from "@/policy";
import {
  selectAge,
  selectBirthDate,
  selectCitizenshipStatus,
  selectFormStep,
  selectMonthlyGrossIncome,
} from "@/stores/selectors";
import type {
  AccountBalances,
  ProjectionParams,
  ProjectionResult,
  ScenarioResult,
} from "@/types";

const scenarioKeys = ["topup", "oasa", "salary", "later"] as const;

type ScenarioKey = (typeof scenarioKeys)[number];

const scenarioChips: { key: ScenarioKey; label: string }[] = [
  { key: "topup", label: "Yearly retirement top-up" },
  { key: "oasa", label: "One-off retirement transfer" },
  { key: "salary", label: "Higher salary" },
  { key: "later", label: "Start five years later" },
];

const scenarioColumnLabels: Record<ScenarioKey, string> = {
  topup: "with a yearly retirement top-up",
  oasa: "with an age-aware retirement transfer",
  salary: "on a higher salary",
  later: "starting five years later",
};

const TOP_UP_AMOUNT = 5_000;
const OA_TO_SA_AMOUNT = 30_000;
const SALARY_DELTA = 1_000;
const YEARS_LATER = 5;
const END_AGE =
  CPF_POLICY_CATALOGUE.rules.lifecycleAges.cpfLifePayoutEligibility;
const RETIREMENT_AGE =
  CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;
const START_MONTH = CPF_POLICY_CATALOGUE.metadata[
  "cpf-contribution-rates"
].verifiedAt.slice(0, 7);
const INTEREST_TIMING = CPF_POLICY_CATALOGUE.rules.interestTransactions;

const assumptions = [
  "Salary held flat, no raises, no gaps in employment, no bonuses.",
  "Starting OA, SA, MA, and RA balances are set to zero in this quick comparison.",
  "Published CPF policies are used where available; later BHS and retirement sums are frozen and flagged as assumptions.",
  `Interest is accrued ${INTEREST_TIMING.computation} and credited ${INTEREST_TIMING.crediting}; no housing use or Additional Wages are inferred.`,
];

interface ComparisonRow {
  label: string;
  baseline: number;
  scenario: number;
  isAccent?: boolean;
}

function balancesAt65(result: ProjectionResult): AccountBalances {
  const milestone = result.milestones.age65;
  const total = milestone
    ? milestone.oa + milestone.sa + milestone.ma + milestone.ra
    : 0;

  if (milestone && total > 0) {
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
      label: `Total contributed to ${END_AGE}`,
      baseline: baseline.totalContributed,
      scenario: scenario.totalContributed,
    },
    {
      label: "Interest earned",
      baseline: baseline.totalInterestEarned,
      scenario: scenario.totalInterestEarned,
    },
    {
      label: `All accounts at ${END_AGE}`,
      baseline: baselineTotal,
      scenario: scenarioTotal,
    },
    {
      label: `Retirement Account at ${END_AGE}`,
      baseline: baselineAt65.ra,
      scenario: scenarioAt65.ra,
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
      <Typography color="muted" type="body-sm">
        {label}
      </Typography>
      <div className="flex items-baseline gap-2">
        {delta !== undefined && (
          <Typography
            className={isAccent ? "text-accent" : undefined}
            color={isAccent ? "default" : "muted"}
            type="body-xs"
          >
            {formatDelta(delta)}
          </Typography>
        )}
        <Typography type="body-sm" weight="semibold">
          {formatCurrency(value, 0)}
        </Typography>
      </div>
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
        <Card.Title>{title}</Card.Title>
        <Chip size="sm" color={isScenario ? "accent" : "default"}>
          <Chip.Label>{tag}</Chip.Label>
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

function EmptyState() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Enter your salary and date of birth</Card.Title>
        <Card.Description>
          The comparison runs on your own numbers. Add them on the home page and
          this screen fills in.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <Link href="/">Go to the home page</Link>
      </Card.Content>
    </Card>
  );
}

function ComparisonSkeleton() {
  return <Skeleton className="h-96 w-full" />;
}

function AssumptionsCard() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>What both columns assume</Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {assumptions.map((assumption, index) => (
            <div key={assumption} className="flex gap-4">
              <Typography color="muted" type="body-xs">
                {String(index + 1).padStart(2, "0")}
              </Typography>
              <Typography className="max-w-[64ch]" color="muted" type="body-sm">
                {assumption}
              </Typography>
            </div>
          ))}
        </div>
        <Separator />
        <Typography className="max-w-[64ch]" color="muted" type="body-sm">
          A projection is a calculation about assumptions, not a forecast about
          you. Estimates only, not financial advice.
        </Typography>
      </Card.Content>
    </Card>
  );
}

export default function WhatIfContent() {
  const [scenario, setScenario] = useQueryState(
    "scenario",
    parseAsStringLiteral(scenarioKeys).withDefault("topup"),
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const formStep = useCpfStore(selectFormStep);
  const age = useCpfStore(selectAge);
  const monthlyIncome = useCpfStore(selectMonthlyGrossIncome);
  const birthDate = useCpfStore(selectBirthDate);
  const citizenshipStatus = useCpfStore(selectCitizenshipStatus);

  const result: ScenarioResult | null = useMemo(() => {
    if (formStep < 2) {
      return null;
    }

    const projection: ProjectionParams = {
      monthlyIncome,
      birthDate,
      startMonth: START_MONTH,
      endAge: END_AGE,
      initialBalances: { oa: 0, sa: 0, ma: 0, ra: 0 },
      netSaSavingsWithdrawnForInvestments: 0,
      retirementRouting: "full-retirement-sum",
      citizenship: citizenshipStatus,
    };

    switch (scenario) {
      case "topup":
        return calculateVoluntaryTopUpScenario({
          projection,
          amount: TOP_UP_AMOUNT,
          account: "retirement",
          frequency: "yearly",
        });
      case "oasa":
        return calculateRetirementTransferScenario({
          projection,
          transferAmount: OA_TO_SA_AMOUNT,
          timing: "now",
        });
      case "salary":
        return calculateSalaryChangeScenario({
          projection,
          newMonthlyIncome: monthlyIncome + SALARY_DELTA,
        });
      default:
        return calculateAgeComparisonScenario({
          monthlyIncome,
          endAge: END_AGE,
          citizenship: citizenshipStatus,
          baselineStartAge: age,
          scenarioStartAge: age + YEARS_LATER,
        });
    }
  }, [formStep, monthlyIncome, birthDate, citizenshipStatus, scenario, age]);

  const descriptions: Record<ScenarioKey, string> = {
    topup: `${formatCurrency(TOP_UP_AMOUNT, 0)} added each year to SA before ${RETIREMENT_AGE} or RA from ${RETIREMENT_AGE}, on top of mandatory contributions. Tax relief is assessed separately.`,
    oasa: `Up to ${formatCurrency(OA_TO_SA_AMOUNT, 0)} moved once from OA to SA before ${RETIREMENT_AGE} or RA from ${RETIREMENT_AGE}, limited by the available OA balance. The transfer is irreversible.`,
    salary: `${formatCurrency(monthlyIncome + SALARY_DELTA, 0)} a month instead of ${formatCurrency(monthlyIncome, 0)}, held flat to ${END_AGE}.`,
    later: `First contribution at age ${age + YEARS_LATER} instead of ${age}, five fewer years of contributions and compounding.`,
  };

  const rows = result ? buildRows(result.baseline, result.scenario) : [];

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        eyebrow="Compare"
        title="Two sets of assumptions, side by side"
        lede="Change one thing and see what the arithmetic does. This tool states differences; it does not suggest which column you should prefer."
      />

      <Card>
        <Card.Header>
          <Typography color="muted" type="body-xs">
            Change one assumption
          </Typography>
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
          <Typography className="max-w-[64ch]" color="muted" type="body-sm">
            {mounted ? descriptions[scenario] : null}
          </Typography>
        </Card.Content>
      </Card>

      {!mounted ? (
        <ComparisonSkeleton />
      ) : result === null ? (
        <EmptyState />
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
