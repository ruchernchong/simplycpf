"use client";

import { FlashIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CitizenshipStatus,
  OaToSaTransfer,
  VoluntaryTopUp,
} from "@/types";

export interface ProjectionFormValues {
  monthlyIncome: number;
  birthDate: string;
  endAge: number;
  citizenship: CitizenshipStatus;
  housingWithdrawal: number;
  topUpAmount: number;
  topUpAccount: VoluntaryTopUp["account"];
  transferAmount: number;
  transferTiming: OaToSaTransfer["timing"];
}

interface ProjectionFormProps {
  values: ProjectionFormValues;
  currentAge: number | null;
  hasValidBirthDate: boolean;
  hasValidRange: boolean;
  isPending: boolean;
  onBirthDateChange: (rawValue: string) => void;
  onChange: (nextValues: Partial<ProjectionFormValues>) => void;
  onReset: () => void;
}

const citizenshipOptions: {
  label: string;
  value: CitizenshipStatus;
}[] = [
  { label: "Singapore Citizen", value: "citizen" },
  { label: "1st year PR", value: "spr-year1" },
  { label: "2nd year PR", value: "spr-year2" },
  { label: "3rd year PR onwards", value: "spr-year3-plus" },
];

const topUpAccounts: VoluntaryTopUp["account"][] = ["SA", "MA", "RA"];

const transferTimingOptions: {
  label: string;
  value: OaToSaTransfer["timing"];
}[] = [
  { label: "One-off now", value: "now" },
  { label: "Repeat yearly", value: "yearly" },
];

function parseNumericInput(value: string): number {
  return Number.parseFloat(value) || 0;
}

function isCitizenshipStatus(value: string | null): value is CitizenshipStatus {
  return citizenshipOptions.some((option) => option.value === value);
}

function isTopUpAccount(
  value: string | null,
): value is VoluntaryTopUp["account"] {
  return topUpAccounts.some((account) => account === value);
}

function isTransferTiming(
  value: string | null,
): value is OaToSaTransfer["timing"] {
  return transferTimingOptions.some((option) => option.value === value);
}

export default function ProjectionForm({
  values,
  currentAge,
  hasValidBirthDate,
  hasValidRange,
  isPending,
  onBirthDateChange,
  onChange,
  onReset,
}: ProjectionFormProps) {
  return (
    <section
      aria-labelledby="projection-form-heading"
      className="flex h-fit flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="projection-form-heading"
          className="font-semibold text-[16px] text-foreground"
        >
          Your Planning Inputs
        </h2>
        <p className="text-muted-foreground text-xs">
          Income, birth month, and target age drive the projection.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="projection-birth-date">Birth month and year</Label>
        <Input
          id="projection-birth-date"
          type="text"
          maxLength={7}
          placeholder="MM/YYYY"
          value={values.birthDate}
          onChange={(event) => onBirthDateChange(event.target.value)}
          className={
            values.birthDate && !hasValidBirthDate
              ? "border-accent focus-visible:ring-accent"
              : undefined
          }
        />
        {values.birthDate && !hasValidBirthDate ? (
          <p className="text-accent text-xs">
            Enter a valid month and year between 1901 and the current year.
          </p>
        ) : null}
        {currentAge !== null ? (
          <p className="text-muted-foreground text-xs">
            Current age: {currentAge}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="projection-income">Monthly Income</Label>
        <Input
          id="projection-income"
          type="number"
          min={0}
          placeholder="$ 0"
          value={values.monthlyIncome || ""}
          onChange={(event) =>
            onChange({
              monthlyIncome: parseNumericInput(event.target.value),
            })
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="projection-end-age">Target Age</Label>
        <Input
          id="projection-end-age"
          type="number"
          min={Math.max(currentAge ?? 0, 1)}
          max={80}
          value={values.endAge}
          onChange={(event) =>
            onChange({
              endAge: Math.max(parseNumericInput(event.target.value), 1),
            })
          }
        />
        {hasValidBirthDate && !hasValidRange ? (
          <p className="text-accent text-xs">
            Choose an end age above your current age.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="projection-citizenship">Citizenship status</Label>
        <Select
          items={citizenshipOptions}
          value={values.citizenship}
          onValueChange={(value) => {
            if (isCitizenshipStatus(value)) {
              onChange({ citizenship: value });
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {citizenshipOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="projection-top-up-amount">
          Annual Top-Up (optional)
        </Label>
        <Input
          id="projection-top-up-amount"
          type="number"
          min={0}
          placeholder="$ 0"
          value={values.topUpAmount || ""}
          onChange={(event) =>
            onChange({ topUpAmount: parseNumericInput(event.target.value) })
          }
        />
        <p className="text-muted-foreground text-xs">
          Yearly cash top-up. Tax relief capped at S$8,000.
        </p>
      </div>

      <Button type="button" size="lg" className="w-full">
        Refresh Projection
      </Button>

      <details className="-mx-2 flex flex-col gap-2 px-2">
        <summary className="cursor-pointer font-medium text-[12px] text-muted-foreground hover:text-foreground">
          Advanced assumptions
        </summary>
        <div className="flex flex-col gap-4 pb-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="projection-housing-withdrawal">
              Monthly housing withdrawal from OA
            </Label>
            <Input
              id="projection-housing-withdrawal"
              type="number"
              min={0}
              placeholder="$ 0"
              value={values.housingWithdrawal || ""}
              onChange={(event) =>
                onChange({
                  housingWithdrawal: parseNumericInput(event.target.value),
                })
              }
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="projection-top-up-account">Top-up account</Label>
              <Select
                value={values.topUpAccount}
                onValueChange={(value) => {
                  if (isTopUpAccount(value)) {
                    onChange({ topUpAccount: value });
                  }
                }}
              >
                <SelectTrigger
                  id="projection-top-up-account"
                  className="w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {topUpAccounts.map((account) => (
                    <SelectItem key={account} value={account}>
                      {account}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="projection-transfer-amount">
                OA to SA transfer
              </Label>
              <Input
                id="projection-transfer-amount"
                type="number"
                min={0}
                placeholder="$ 0"
                value={values.transferAmount || ""}
                onChange={(event) =>
                  onChange({
                    transferAmount: parseNumericInput(event.target.value),
                  })
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="projection-transfer-timing">Transfer timing</Label>
            <Select
              items={transferTimingOptions}
              value={values.transferTiming}
              onValueChange={(value) => {
                if (isTransferTiming(value)) {
                  onChange({ transferTiming: value });
                }
              }}
            >
              <SelectTrigger id="projection-transfer-timing" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transferTimingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </details>

      <div className="flex items-center justify-between gap-2 border-border border-t text-muted-foreground text-xs">
        <span className="inline-flex items-center gap-1.5">
          <HugeiconsIcon
            icon={FlashIcon}
            className="size-3.5 text-accent"
            strokeWidth={2}
          />
          OA 2.5%, SMRA 4.0% floor rates
        </span>
        <button
          type="button"
          onClick={onReset}
          disabled={isPending}
          className="rounded-md px-2 py-1 text-[12px] hover:text-foreground"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
