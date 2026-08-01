"use client";

import { Button, Card, Typography } from "@heroui/react";
import dynamic from "next/dynamic";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useState, useTransition } from "react";
import { calculateCpfProjection } from "@/lib/calculate-cpf-projection";
import { convertBirthDateToAge } from "@/lib/convert-birth-date-to-age";
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
        <Card.Title>Balance Growth Over Time</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="h-[360px] animate-pulse rounded-2xl bg-surface-secondary" />
      </Card.Content>
    </Card>
  ),
});

const defaultFormValues: ProjectionFormValues = {
  monthlyIncome: 0,
  birthDate: "",
  endAge: 65,
  citizenship: "citizen",
  housingWithdrawal: 0,
  topUpAmount: 0,
  topUpAccount: "SA",
  transferAmount: 0,
  transferTiming: "now",
};

const citizenshipStatuses = [
  "citizen",
  "spr-year1",
  "spr-year2",
  "spr-year3-plus",
] as const;

const topUpAccounts = ["SA", "MA", "RA"] as const;
const transferTimings = ["now", "yearly"] as const;

const projectionSearchParams = {
  monthlyIncome: parseAsInteger.withDefault(defaultFormValues.monthlyIncome),
  birthDate: parseAsString.withDefault(defaultFormValues.birthDate),
  endAge: parseAsInteger.withDefault(defaultFormValues.endAge),
  citizenship: parseAsStringLiteral(citizenshipStatuses).withDefault(
    defaultFormValues.citizenship,
  ),
  housingWithdrawal: parseAsInteger.withDefault(
    defaultFormValues.housingWithdrawal,
  ),
  topUpAmount: parseAsInteger.withDefault(defaultFormValues.topUpAmount),
  topUpAccount: parseAsStringLiteral(topUpAccounts).withDefault(
    defaultFormValues.topUpAccount,
  ),
  transferAmount: parseAsInteger.withDefault(defaultFormValues.transferAmount),
  transferTiming: parseAsStringLiteral(transferTimings).withDefault(
    defaultFormValues.transferTiming,
  ),
};

function getTotalBalance(params: {
  oa: number;
  sa: number;
  ma: number;
  ra: number;
}) {
  return params.oa + params.sa + params.ma + params.ra;
}

export default function ProjectionContent() {
  const [values, setValues] = useQueryStates(projectionSearchParams, {
    urlKeys: {
      monthlyIncome: "income",
      housingWithdrawal: "housing",
      topUpAmount: "topUp",
      transferAmount: "transfer",
    },
  });
  const [isPending, startTransition] = useTransition();
  const [linkCopied, setLinkCopied] = useState(false);

  const hasValidBirthDate = isValidDateFormat(values.birthDate);
  const currentAge = hasValidBirthDate
    ? convertBirthDateToAge(values.birthDate)
    : null;
  const hasValidRange = currentAge === null || values.endAge >= currentAge;
  const canProject =
    values.monthlyIncome > 0 && hasValidBirthDate && hasValidRange;

  const projectionParams: ProjectionParams | null = canProject
    ? {
        monthlyIncome: values.monthlyIncome,
        birthDate: values.birthDate,
        endAge: values.endAge,
        citizenship: values.citizenship,
        ...(values.housingWithdrawal > 0
          ? { housingWithdrawal: values.housingWithdrawal }
          : {}),
        ...(values.topUpAmount > 0
          ? {
              voluntaryTopUp: {
                amount: values.topUpAmount,
                account: values.topUpAccount,
                frequency: "yearly",
              },
            }
          : {}),
        ...(values.transferAmount > 0
          ? {
              oaToSaTransfer: {
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
  const finalBalance = result
    ? result.yearlyBalances[result.yearlyBalances.length - 1]
    : null;

  const handleChange = (nextValues: Partial<ProjectionFormValues>) => {
    startTransition(() => {
      void setValues(nextValues);
    });
  };

  const handleBirthDateChange = (rawValue: string) => {
    const birthDate = formatDateInput(rawValue, values.birthDate);

    startTransition(() => {
      void setValues({
        birthDate: birthDate.length > 0 ? birthDate : null,
      });
    });
  };

  const handleReset = () => {
    startTransition(() => {
      void setValues(null);
    });
  };

  const handleCopyProjectionLink = async () => {
    try {
      await navigator.clipboard.writeText(
        globalThis.window?.location.href ?? "",
      );
      setLinkCopied(true);
      globalThis.window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <ProjectionForm
        values={values}
        currentAge={currentAge}
        hasValidBirthDate={hasValidBirthDate}
        hasValidRange={hasValidRange}
        isPending={isPending}
        onBirthDateChange={handleBirthDateChange}
        onChange={handleChange}
        onReset={handleReset}
      />

      <div className="flex flex-col gap-6">
        {result && finalBalance ? (
          <>
            <div className="flex justify-end">
              <Button variant="outline" onPress={handleCopyProjectionLink}>
                {linkCopied ? "Link copied" : "Copy share link"}
              </Button>
            </div>
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
                Add your income and birth date to start the projection.
              </Card.Description>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <Typography color="muted" type="body-sm">
                The current model uses CPF floor interest rates, your selected
                citizenship status, and today&apos;s contribution rules.
              </Typography>
              <ul className="flex list-disc flex-col gap-2 pl-6 text-muted text-sm">
                <li>Age 55 conversion from SA to RA is included.</li>
                <li>BHS overflow from MA is redirected automatically.</li>
                <li>CPF LIFE payouts are estimates, not official quotes.</li>
              </ul>
              {!hasValidRange && currentAge !== null ? (
                <Typography className="text-accent" type="body-sm">
                  Your end age needs to be above your current age of{" "}
                  {currentAge}.
                </Typography>
              ) : null}
            </Card.Content>
          </Card>
        )}
      </div>
    </div>
  );
}
