"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VoluntaryTopUp } from "@/types";
import SharedProjectionFields, {
  type SharedProjectionFieldsValues,
} from "./shared-projection-fields";

export interface VoluntaryTopUpFormValues extends SharedProjectionFieldsValues {
  topUpAmount: number;
  topUpAccount: VoluntaryTopUp["account"];
}

interface VoluntaryTopUpFormProps {
  values: VoluntaryTopUpFormValues;
  currentAge: number | null;
  hasValidBirthDate: boolean;
  hasValidRange: boolean;
  onBirthDateChange: (rawValue: string) => void;
  onChange: (nextValues: Partial<VoluntaryTopUpFormValues>) => void;
}

const topUpAccounts: VoluntaryTopUp["account"][] = ["SA", "MA", "RA"];

function parseNumericInput(value: string): number {
  return Number.parseFloat(value) || 0;
}

function isTopUpAccount(
  value: string | null,
): value is VoluntaryTopUp["account"] {
  return topUpAccounts.some((account) => account === value);
}

export default function VoluntaryTopUpForm({
  values,
  currentAge,
  hasValidBirthDate,
  hasValidRange,
  onBirthDateChange,
  onChange,
}: VoluntaryTopUpFormProps) {
  return (
    <div className="flex flex-col gap-6">
      <SharedProjectionFields
        values={values}
        currentAge={currentAge}
        hasValidBirthDate={hasValidBirthDate}
        hasValidRange={hasValidRange}
        onBirthDateChange={onBirthDateChange}
        onMonthlyIncomeChange={(monthlyIncome) => onChange({ monthlyIncome })}
        onEndAgeChange={(endAge) => onChange({ endAge })}
        onCitizenshipChange={(citizenship) => onChange({ citizenship })}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="top-up-amount">Annual top-up amount</Label>
          <Input
            id="top-up-amount"
            type="number"
            min={0}
            placeholder="0"
            value={values.topUpAmount || ""}
            onChange={(event) =>
              onChange({ topUpAmount: parseNumericInput(event.target.value) })
            }
          />
          <p className="text-muted-foreground text-xs">
            Compare the effect of adding one top-up each year.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="top-up-account">Top-up account</Label>
          <Select
            value={values.topUpAccount}
            onValueChange={(value) => {
              if (isTopUpAccount(value)) {
                onChange({ topUpAccount: value });
              }
            }}
          >
            <SelectTrigger id="top-up-account" className="w-full rounded-lg">
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
      </div>
    </div>
  );
}
