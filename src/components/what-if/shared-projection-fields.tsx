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
import type { CitizenshipStatus } from "@/types";

export interface SharedProjectionFieldsValues {
  monthlyIncome: number;
  birthDate: string;
  endAge: number;
  citizenship: CitizenshipStatus;
}

interface SharedProjectionFieldsProps {
  values: SharedProjectionFieldsValues;
  currentAge: number | null;
  hasValidBirthDate: boolean;
  hasValidRange: boolean;
  onBirthDateChange: (rawValue: string) => void;
  onMonthlyIncomeChange: (value: number) => void;
  onEndAgeChange: (value: number) => void;
  onCitizenshipChange: (value: CitizenshipStatus) => void;
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

function parseNumericInput(value: string): number {
  return Number.parseFloat(value) || 0;
}

function isCitizenshipStatus(value: string | null): value is CitizenshipStatus {
  return citizenshipOptions.some((option) => option.value === value);
}

export default function SharedProjectionFields({
  values,
  currentAge,
  hasValidBirthDate,
  hasValidRange,
  onBirthDateChange,
  onMonthlyIncomeChange,
  onEndAgeChange,
  onCitizenshipChange,
}: SharedProjectionFieldsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="what-if-income">Gross monthly income</Label>
        <Input
          id="what-if-income"
          type="number"
          min={0}
          placeholder="0"
          value={values.monthlyIncome || ""}
          onChange={(event) =>
            onMonthlyIncomeChange(parseNumericInput(event.target.value))
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="what-if-birth-date">Birth month and year</Label>
        <Input
          id="what-if-birth-date"
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
        <Label htmlFor="what-if-citizenship">Citizenship status</Label>
        <Select
          value={values.citizenship}
          onValueChange={(value) => {
            if (isCitizenshipStatus(value)) {
              onCitizenshipChange(value);
            }
          }}
        >
          <SelectTrigger id="what-if-citizenship" className="w-full rounded-lg">
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
        <Label htmlFor="what-if-end-age">Compare at age</Label>
        <Input
          id="what-if-end-age"
          type="number"
          min={65}
          max={80}
          value={values.endAge}
          onChange={(event) =>
            onEndAgeChange(Math.max(parseNumericInput(event.target.value), 65))
          }
        />
        {hasValidBirthDate && !hasValidRange ? (
          <p className="text-accent text-xs">
            Choose an end age above your current age.
          </p>
        ) : null}
      </div>
    </div>
  );
}
