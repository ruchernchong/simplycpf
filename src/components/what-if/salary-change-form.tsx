"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SharedProjectionFields, {
  type SharedProjectionFieldsValues,
} from "./shared-projection-fields";

export interface SalaryChangeFormValues extends SharedProjectionFieldsValues {
  newIncome: number;
}

interface SalaryChangeFormProps {
  values: SalaryChangeFormValues;
  currentAge: number | null;
  hasValidBirthDate: boolean;
  hasValidRange: boolean;
  onBirthDateChange: (rawValue: string) => void;
  onChange: (nextValues: Partial<SalaryChangeFormValues>) => void;
}

function parseNumericInput(value: string): number {
  return Number.parseFloat(value) || 0;
}

export default function SalaryChangeForm({
  values,
  currentAge,
  hasValidBirthDate,
  hasValidRange,
  onBirthDateChange,
  onChange,
}: SalaryChangeFormProps) {
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="salary-new-income">New monthly income</Label>
        <Input
          id="salary-new-income"
          type="number"
          min={0}
          placeholder="0"
          value={values.newIncome || ""}
          onChange={(event) =>
            onChange({ newIncome: parseNumericInput(event.target.value) })
          }
        />
        <p className="text-muted-foreground text-xs">
          Compare your current pay against the income you want to test.
        </p>
      </div>
    </div>
  );
}
