"use client";

import dynamic from "next/dynamic";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { calculateCpfProjection } from "@/lib/calculate-cpf-projection";
import { convertBirthDateToAge } from "@/lib/convert-birth-date-to-age";
import type { ProjectionParams } from "@/types";
import { formatDateInput, isValidDateFormat } from "@/utils/date-utils";
import CpfLifeEstimate from "./cpf-life-estimate";
import MilestoneCards from "./milestone-cards";
import ProjectionForm, { type ProjectionFormValues } from "./projection-form";
import YearlyProjectionTable from "./yearly-projection-table";

const BalanceGrowthChart = dynamic(() => import("./balance-growth-chart"), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] w-full animate-pulse rounded-lg border border-border bg-card" />
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
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
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
        <div className="flex flex-col gap-4">
          {result ? (
            <>
              <BalanceGrowthChart yearlyBalances={result.yearlyBalances} />
              <MilestoneCards result={result} />
            </>
          ) : (
            <div className="flex h-full min-h-[360px] flex-col items-start justify-center gap-2 rounded-lg border border-border border-dashed bg-card p-8 text-muted-foreground">
              <h3 className="font-semibold text-[16px] text-foreground">
                Your projection will appear here
              </h3>
              <p className="text-[13px]">
                Add your income and birth date to see projected CPF balances
                across OA, SA/RA, and MA.
              </p>
              {!hasValidRange && currentAge !== null ? (
                <p className="text-[13px] text-accent">
                  Your end age needs to be above your current age of{" "}
                  {currentAge}.
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {result ? (
        <>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyProjectionLink}
            >
              {linkCopied ? "Link copied" : "Copy share link"}
            </Button>
          </div>
          <CpfLifeEstimate result={result} />
          <YearlyProjectionTable yearlyBalances={result.yearlyBalances} />
        </>
      ) : null}
    </div>
  );
}
