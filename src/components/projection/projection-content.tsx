"use client";

import { Button, Card, Chip, Typography } from "@heroui/react";
import dynamic from "next/dynamic";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useState, useTransition } from "react";
import { calculateCpfProjection } from "@/lib/calculate-cpf-projection";
import { formatCurrency } from "@/lib/format";
import type { ProjectionParams } from "@/types";
import { formatDateInput, isValidDateFormat } from "@/utils/date-utils";
import CpfLifeEstimate from "./cpf-life-estimate";
import MilestoneCards from "./milestone-cards";
import ProjectionForm, { type ProjectionFormValues } from "./projection-form";
import YearlyProjectionTable from "./yearly-projection-table";

const BalanceGrowthChart = dynamic(() => import("./balance-growth-chart"), {
  ssr: false,
  loading: () => (
    <Card>
      <Card.Header>
        <Card.Title>Balance growth over time</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="h-[360px] animate-pulse rounded-2xl bg-surface-secondary" />
      </Card.Content>
    </Card>
  ),
});

const defaultStartMonth = new Date().toISOString().slice(0, 7);

const defaultFormValues: ProjectionFormValues = {
  monthlyIncome: 0,
  birthDate: "",
  startMonth: defaultStartMonth,
  endAge: 65,
  citizenship: "citizen",
  initialOa: 0,
  initialSa: 0,
  initialMa: 0,
  initialRa: 0,
  housingWithdrawal: 0,
  topUpAmount: 0,
  topUpAccount: "retirement",
  topUpFrequency: "yearly",
  transferAmount: 0,
  transferTiming: "now",
  retirementRouting: "full-retirement-sum",
};

const citizenshipStatuses = [
  "citizen",
  "spr-year1",
  "spr-year2",
  "spr-year3-plus",
] as const;
const topUpAccounts = ["retirement", "MA"] as const;
const topUpFrequencies = ["monthly", "yearly"] as const;
const transferTimings = ["now", "monthly", "yearly"] as const;
const retirementRoutings = [
  "full-retirement-sum",
  "basic-retirement-sum-with-property",
] as const;

const projectionSearchParams = {
  monthlyIncome: parseAsInteger.withDefault(defaultFormValues.monthlyIncome),
  birthDate: parseAsString.withDefault(defaultFormValues.birthDate),
  startMonth: parseAsString.withDefault(defaultFormValues.startMonth),
  endAge: parseAsInteger.withDefault(defaultFormValues.endAge),
  citizenship: parseAsStringLiteral(citizenshipStatuses).withDefault(
    defaultFormValues.citizenship,
  ),
  initialOa: parseAsInteger.withDefault(defaultFormValues.initialOa),
  initialSa: parseAsInteger.withDefault(defaultFormValues.initialSa),
  initialMa: parseAsInteger.withDefault(defaultFormValues.initialMa),
  initialRa: parseAsInteger.withDefault(defaultFormValues.initialRa),
  housingWithdrawal: parseAsInteger.withDefault(
    defaultFormValues.housingWithdrawal,
  ),
  topUpAmount: parseAsInteger.withDefault(defaultFormValues.topUpAmount),
  topUpAccount: parseAsStringLiteral(topUpAccounts).withDefault(
    defaultFormValues.topUpAccount,
  ),
  topUpFrequency: parseAsStringLiteral(topUpFrequencies).withDefault(
    defaultFormValues.topUpFrequency,
  ),
  transferAmount: parseAsInteger.withDefault(defaultFormValues.transferAmount),
  transferTiming: parseAsStringLiteral(transferTimings).withDefault(
    defaultFormValues.transferTiming,
  ),
  retirementRouting: parseAsStringLiteral(retirementRoutings).withDefault(
    defaultFormValues.retirementRouting,
  ),
};

function getTotalBalance(params: {
  oa: number;
  sa: number;
  ma: number;
  ra: number;
}): number {
  return params.oa + params.sa + params.ma + params.ra;
}

function getAgeAtMonth(birthDate: string, month: string): number | null {
  const [birthMonth, birthYear] = birthDate.split("/").map(Number);
  const [year, monthNumber] = month.split("-").map(Number);
  if (!birthMonth || !birthYear || !year || !monthNumber) return null;
  return year - birthYear - (monthNumber < birthMonth ? 1 : 0);
}

export default function ProjectionContent() {
  const [values, setValues] = useQueryStates(projectionSearchParams, {
    urlKeys: {
      monthlyIncome: "income",
      startMonth: "start",
      initialOa: "oa",
      initialSa: "sa",
      initialMa: "ma",
      initialRa: "ra",
      housingWithdrawal: "housing",
      topUpAmount: "topUp",
      transferAmount: "transfer",
    },
  });
  const [isPending, startTransition] = useTransition();
  const [linkCopied, setLinkCopied] = useState(false);

  const hasValidBirthDate = isValidDateFormat(values.birthDate);
  const hasValidStartMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(values.startMonth);
  const currentAge =
    hasValidBirthDate && hasValidStartMonth
      ? getAgeAtMonth(values.birthDate, values.startMonth)
      : null;
  const hasValidRange = currentAge === null || values.endAge >= currentAge;
  const hasValidAccountState =
    currentAge === null ||
    (currentAge < 55 ? values.initialRa === 0 : values.initialSa === 0);
  const canProject =
    hasValidBirthDate &&
    hasValidStartMonth &&
    hasValidRange &&
    hasValidAccountState;

  const projectionParams: ProjectionParams | null = canProject
    ? {
        monthlyIncome: values.monthlyIncome,
        birthDate: values.birthDate,
        startMonth: values.startMonth,
        endAge: values.endAge,
        citizenship: values.citizenship,
        initialBalances: {
          oa: values.initialOa,
          sa: values.initialSa,
          ma: values.initialMa,
          ra: values.initialRa,
        },
        retirementRouting: values.retirementRouting,
        ...(values.housingWithdrawal > 0
          ? { housingWithdrawal: values.housingWithdrawal }
          : {}),
        ...(values.topUpAmount > 0
          ? {
              voluntaryTopUp: {
                amount: values.topUpAmount,
                account: values.topUpAccount,
                frequency: values.topUpFrequency,
              },
            }
          : {}),
        ...(values.transferAmount > 0
          ? {
              retirementTransfer: {
                amount: values.transferAmount,
                timing: values.transferTiming,
              },
            }
          : {}),
      }
    : null;

  const result = projectionParams
    ? calculateCpfProjection(projectionParams)
    : null;
  const finalBalance = result?.yearlyBalances.at(-1) ?? null;

  function handleChange(nextValues: Partial<ProjectionFormValues>): void {
    startTransition(() => {
      void setValues(nextValues);
    });
  }

  function handleBirthDateChange(rawValue: string): void {
    const birthDate = formatDateInput(rawValue, values.birthDate);
    startTransition(() => {
      void setValues({ birthDate: birthDate.length > 0 ? birthDate : null });
    });
  }

  function handleReset(): void {
    startTransition(() => {
      void setValues(null);
    });
  }

  async function handleCopyProjectionLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(globalThis.window.location.href);
      setLinkCopied(true);
      globalThis.window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
      <ProjectionForm
        values={values}
        currentAge={currentAge}
        hasValidBirthDate={hasValidBirthDate}
        hasValidRange={hasValidRange}
        hasValidAccountState={hasValidAccountState}
        isPending={isPending}
        onBirthDateChange={handleBirthDateChange}
        onChange={handleChange}
        onReset={handleReset}
      />

      <div className="flex flex-col gap-6">
        {result && finalBalance ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Chip size="sm" variant="soft">
                  Monthly ledger
                </Chip>
                <Chip size="sm" variant="soft">
                  Published rules freeze after 2027
                </Chip>
              </div>
              <Button variant="outline" onPress={handleCopyProjectionLink}>
                {linkCopied ? "Link copied" : "Copy share link"}
              </Button>
            </div>

            {result.warnings.length > 0 ? (
              <Card>
                <Card.Header>
                  <Card.Title>Projection warnings</Card.Title>
                </Card.Header>
                <Card.Content>
                  <ul className="flex list-disc flex-col gap-2 pl-6 text-muted text-sm">
                    {result.warnings.map((warning) => (
                      <li key={warning.code}>{warning.message}</li>
                    ))}
                  </ul>
                </Card.Content>
              </Card>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <Card.Header>
                  <Card.Description>
                    Projected CPF at age {finalBalance.age}
                  </Card.Description>
                  <Card.Title>
                    {formatCurrency(getTotalBalance(finalBalance.balances), 0)}
                  </Card.Title>
                </Card.Header>
              </Card>
              <Card>
                <Card.Header>
                  <Card.Description>Total contributions</Card.Description>
                  <Card.Title>
                    {formatCurrency(result.totalContributed, 0)}
                  </Card.Title>
                </Card.Header>
              </Card>
              <Card>
                <Card.Header>
                  <Card.Description>Total interest earned</Card.Description>
                  <Card.Title>
                    {formatCurrency(result.totalInterestEarned, 0)}
                  </Card.Title>
                </Card.Header>
              </Card>
            </div>

            <BalanceGrowthChart yearlyBalances={result.yearlyBalances} />
            <MilestoneCards result={result} />
            <CpfLifeEstimate result={result} />
            <YearlyProjectionTable yearlyBalances={result.yearlyBalances} />
          </>
        ) : (
          <Card>
            <Card.Header>
              <Card.Title>Your projection will appear here</Card.Title>
              <Card.Description>
                Add your birth month and all four starting balances. Monthly
                income may be zero.
              </Card.Description>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <Typography color="muted" type="body-sm">
                The model uses fixed monthly Ordinary Wages, CPF floor interest
                rates and the last published policy after official schedules
                end.
              </Typography>
              <ul className="flex list-disc flex-col gap-2 pl-6 text-muted text-sm">
                <li>
                  Contributions move age bands in the month after a birthday.
                </li>
                <li>SA closure and Retirement Account routing are included.</li>
                <li>BHS is frozen for the member&apos;s cohort at age 65.</li>
                <li>CPF LIFE is shown only as CPF Board reference rows.</li>
              </ul>
            </Card.Content>
          </Card>
        )}
      </div>
    </div>
  );
}
