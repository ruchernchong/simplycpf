"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Balance Growth Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[360px] animate-pulse rounded-lg bg-zinc-200" />
      </CardContent>
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

function getTotalBalance(params: {
  oa: number;
  sa: number;
  ma: number;
  ra: number;
}) {
  return params.oa + params.sa + params.ma + params.ra;
}

export default function ProjectionContent() {
  const [values, setValues] = useState(defaultFormValues);
  const [isPending, startTransition] = useTransition();

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
      setValues((currentValues) => ({
        ...currentValues,
        ...nextValues,
      }));
    });
  };

  const handleBirthDateChange = (rawValue: string) => {
    handleChange({
      birthDate: formatDateInput(rawValue, values.birthDate),
    });
  };

  const handleReset = () => {
    startTransition(() => {
      setValues(defaultFormValues);
    });
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
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="shadow-md">
                <CardHeader>
                  <CardDescription>
                    Projected CPF at age {finalBalance.age}
                  </CardDescription>
                  <CardTitle className="text-2xl">
                    {formatCurrency(getTotalBalance(finalBalance.balances), 0)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="shadow-md">
                <CardHeader>
                  <CardDescription>Total contributions</CardDescription>
                  <CardTitle className="text-2xl">
                    {formatCurrency(result.totalContributed, 0)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="shadow-md">
                <CardHeader>
                  <CardDescription>Total interest earned</CardDescription>
                  <CardTitle className="text-2xl">
                    {formatCurrency(result.totalInterestEarned, 0)}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <BalanceGrowthChart yearlyBalances={result.yearlyBalances} />
            <MilestoneCards result={result} />
            <CpfLifeEstimate result={result} />
            <YearlyProjectionTable yearlyBalances={result.yearlyBalances} />
          </>
        ) : (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Your projection will appear here</CardTitle>
              <CardDescription>
                Add your income and birth date to start the projection.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-muted-foreground text-sm">
              <p>
                The current model uses CPF floor interest rates, your selected
                citizenship status, and today&apos;s contribution rules.
              </p>
              <ul className="flex list-disc flex-col gap-2 pl-6">
                <li>Age 55 conversion from SA to RA is included.</li>
                <li>BHS overflow from MA is redirected automatically.</li>
                <li>CPF LIFE payouts are estimates, not official quotes.</li>
              </ul>
              {!hasValidRange && currentAge !== null ? (
                <p className="text-accent">
                  Your end age needs to be above your current age of{" "}
                  {currentAge}.
                </p>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
