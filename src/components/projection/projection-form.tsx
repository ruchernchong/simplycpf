"use client";

import { FlashIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Projection Assumptions</CardTitle>
        <CardDescription>
          Start with your income and birth month, then adjust optional CPF
          planning moves.
        </CardDescription>
        <div className="flex items-center gap-2 rounded-md bg-accent/5 px-4 py-2 text-accent text-xs">
          <HugeiconsIcon
            icon={FlashIcon}
            className="size-3.5"
            strokeWidth={2}
          />
          Uses conservative floor rates: OA 2.5% p.a., SA/MA/RA 4.0% p.a.
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="projection-income">Gross monthly income</Label>
            <Input
              id="projection-income"
              type="number"
              min={0}
              placeholder="0"
              value={values.monthlyIncome || ""}
              onChange={(event) =>
                onChange({
                  monthlyIncome: parseNumericInput(event.target.value),
                })
              }
            />
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
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
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
              <SelectTrigger className="w-full rounded-lg">
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
            <Label htmlFor="projection-end-age">Project until age</Label>
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
        </div>

        <div className="border-border border-t" />
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="projection-housing-withdrawal">
              Monthly housing withdrawal from OA
            </Label>
            <Input
              id="projection-housing-withdrawal"
              type="number"
              min={0}
              placeholder="0"
              value={values.housingWithdrawal || ""}
              onChange={(event) =>
                onChange({
                  housingWithdrawal: parseNumericInput(event.target.value),
                })
              }
            />
            <p className="text-muted-foreground text-xs">
              Use this if you regularly use OA for your housing loan.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="projection-top-up-amount">
              Annual voluntary top-up
            </Label>
            <Input
              id="projection-top-up-amount"
              type="number"
              min={0}
              placeholder="0"
              value={values.topUpAmount || ""}
              onChange={(event) =>
                onChange({ topUpAmount: parseNumericInput(event.target.value) })
              }
            />
            <p className="text-muted-foreground text-xs">
              The current model treats this as a yearly top-up and caps tax
              relief at S$8,000.
            </p>
          </div>
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
                className="w-full rounded-lg"
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
              placeholder="0"
              value={values.transferAmount || ""}
              onChange={(event) =>
                onChange({
                  transferAmount: parseNumericInput(event.target.value),
                })
              }
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
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
              <SelectTrigger
                id="projection-transfer-timing"
                className="w-full rounded-lg sm:max-w-xs"
              >
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
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="outline" onClick={onReset} disabled={isPending}>
          Reset assumptions
        </Button>
      </CardFooter>
    </Card>
  );
}
