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

export interface AgeComparisonFormValues {
  monthlyIncome: number;
  endAge: number;
  citizenship: CitizenshipStatus;
  baselineStartAge: number;
  scenarioStartAge: number;
}

interface AgeComparisonFormProps {
  values: AgeComparisonFormValues;
  hasValidRange: boolean;
  onChange: (nextValues: Partial<AgeComparisonFormValues>) => void;
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

const startAgeOptions = [25, 35, 45, 55];

function parseNumericInput(value: string): number {
  return Number.parseFloat(value) || 0;
}

function isCitizenshipStatus(value: string | null): value is CitizenshipStatus {
  return citizenshipOptions.some((option) => option.value === value);
}

function isStartAgeOption(value: string | null): value is `${number}` {
  return startAgeOptions.some((age) => age.toString() === value);
}

export default function AgeComparisonForm({
  values,
  hasValidRange,
  onChange,
}: AgeComparisonFormProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="age-comparison-income">Gross monthly income</Label>
          <Input
            id="age-comparison-income"
            type="number"
            min={0}
            placeholder="0"
            value={values.monthlyIncome || ""}
            onChange={(event) =>
              onChange({ monthlyIncome: parseNumericInput(event.target.value) })
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="age-comparison-citizenship">Citizenship status</Label>
          <Select
            value={values.citizenship}
            onValueChange={(value) => {
              if (isCitizenshipStatus(value)) {
                onChange({ citizenship: value });
              }
            }}
          >
            <SelectTrigger
              id="age-comparison-citizenship"
              className="w-full rounded-lg"
            >
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
          <Label htmlFor="baseline-start-age">Baseline start age</Label>
          <Select
            value={values.baselineStartAge.toString()}
            onValueChange={(value) => {
              if (isStartAgeOption(value)) {
                onChange({ baselineStartAge: Number(value) });
              }
            }}
          >
            <SelectTrigger
              id="baseline-start-age"
              className="w-full rounded-lg"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {startAgeOptions.map((age) => (
                <SelectItem key={age} value={age.toString()}>
                  Start at age {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="scenario-start-age">Scenario start age</Label>
          <Select
            value={values.scenarioStartAge.toString()}
            onValueChange={(value) => {
              if (isStartAgeOption(value)) {
                onChange({ scenarioStartAge: Number(value) });
              }
            }}
          >
            <SelectTrigger
              id="scenario-start-age"
              className="w-full rounded-lg"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {startAgeOptions.map((age) => (
                <SelectItem key={age} value={age.toString()}>
                  Start at age {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="age-comparison-end-age">Compare at age</Label>
          <Input
            id="age-comparison-end-age"
            type="number"
            min={65}
            max={80}
            value={values.endAge}
            onChange={(event) =>
              onChange({
                endAge: Math.max(parseNumericInput(event.target.value), 65),
              })
            }
          />
          {!hasValidRange ? (
            <p className="text-accent text-xs">
              Choose an end age above both start ages.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
