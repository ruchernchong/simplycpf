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
import type { OaToSaTransfer } from "@/types";
import SharedProjectionFields, {
  type SharedProjectionFieldsValues,
} from "./shared-projection-fields";

export interface OaToSaFormValues extends SharedProjectionFieldsValues {
  transferAmount: number;
  transferTiming: OaToSaTransfer["timing"];
}

interface OaToSaFormProps {
  values: OaToSaFormValues;
  currentAge: number | null;
  hasValidBirthDate: boolean;
  hasValidRange: boolean;
  onBirthDateChange: (rawValue: string) => void;
  onChange: (nextValues: Partial<OaToSaFormValues>) => void;
}

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

function isTransferTiming(
  value: string | null,
): value is OaToSaTransfer["timing"] {
  return transferTimingOptions.some((option) => option.value === value);
}

export default function OaToSaForm({
  values,
  currentAge,
  hasValidBirthDate,
  hasValidRange,
  onBirthDateChange,
  onChange,
}: OaToSaFormProps) {
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
          <Label htmlFor="transfer-amount">Transfer amount</Label>
          <Input
            id="transfer-amount"
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="transfer-timing">Transfer timing</Label>
          <Select
            items={transferTimingOptions}
            value={values.transferTiming}
            onValueChange={(value) => {
              if (isTransferTiming(value)) {
                onChange({ transferTiming: value });
              }
            }}
          >
            <SelectTrigger id="transfer-timing" className="w-full rounded-lg">
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
    </div>
  );
}
