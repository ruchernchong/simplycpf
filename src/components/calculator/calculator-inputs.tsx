"use client";

import {
  Card,
  Description,
  Input,
  Label,
  NumberField,
  Surface,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@heroui/react";
import { useCpfStore } from "@/hooks/use-cpf-store";
import { formatDate } from "@/lib/format";
import {
  selectAge,
  selectAgeGroup,
  selectBirthDate,
  selectCitizenshipStatus,
  selectMonthlyGrossIncome,
} from "@/stores/selectors";
import type { CitizenshipStatus } from "@/types";
import { formatDateInput, isValidDateFormat } from "@/utils/date-utils";
import { formatRate } from "./figures";

const CITIZENSHIP_OPTIONS: { value: CitizenshipStatus; label: string }[] = [
  { value: "citizen", label: "Citizen" },
  { value: "spr-year1", label: "PR 1st yr" },
  { value: "spr-year2", label: "PR 2nd yr" },
  { value: "spr-year3-plus", label: "PR 3rd yr+" },
];

interface CalculatorInputsProps {
  ceilingDate: string;
}

export function CalculatorInputs({ ceilingDate }: CalculatorInputsProps) {
  const income = useCpfStore(selectMonthlyGrossIncome);
  const birthDate = useCpfStore(selectBirthDate);
  const citizenshipStatus = useCpfStore(selectCitizenshipStatus);
  const age = useCpfStore(selectAge);
  const ageGroup = useCpfStore(selectAgeGroup);

  const setIncome = useCpfStore((state) => state.setIncome);
  const setBirthDate = useCpfStore((state) => state.setBirthDate);
  const setCitizenshipStatus = useCpfStore(
    (state) => state.setCitizenshipStatus,
  );

  const hasBirthDate = isValidDateFormat(birthDate);
  const isBirthDateInvalid = birthDate.length > 0 && !hasBirthDate;

  return (
    <Card className="sticky top-24 flex flex-col gap-6 p-6">
      <Typography color="muted" type="body-xs">
        Your inputs
      </Typography>

      <NumberField
        className="flex flex-col gap-2"
        formatOptions={{
          style: "currency",
          currency: "SGD",
          currencyDisplay: "narrowSymbol",
          maximumFractionDigits: 0,
        }}
        minValue={0}
        onChange={(value) => setIncome(Number.isNaN(value) ? 0 : value)}
        step={100}
        value={income}
      >
        <Label>Monthly gross salary</Label>
        <NumberField.Group className="w-full grid-cols-1">
          <NumberField.Input className="w-full font-semibold" />
        </NumberField.Group>
      </NumberField>

      <TextField
        className="flex flex-col gap-2"
        isInvalid={isBirthDateInvalid}
        onChange={(value) => setBirthDate(formatDateInput(value, birthDate))}
        value={birthDate}
      >
        <div className="flex items-baseline justify-between gap-4">
          <Label>Date of birth</Label>
          <Description>{hasBirthDate ? `Age ${age}` : "MM/YYYY"}</Description>
        </div>
        <Input inputMode="numeric" placeholder="MM/YYYY" />
      </TextField>

      <div className="flex flex-col gap-2">
        <Label id="citizenship-label">Citizenship</Label>
        <ToggleButtonGroup
          aria-labelledby="citizenship-label"
          className="flex flex-wrap gap-2"
          disallowEmptySelection
          isDetached
          onSelectionChange={(keys) => {
            const [next] = Array.from(keys);
            if (next) setCitizenshipStatus(next as CitizenshipStatus);
          }}
          selectedKeys={[citizenshipStatus]}
          selectionMode="single"
          size="sm"
        >
          {CITIZENSHIP_OPTIONS.map((option) => (
            <ToggleButton id={option.value} key={option.value}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      <Surface
        className="flex flex-col gap-1 rounded-2xl p-4"
        variant="tertiary"
      >
        <Typography type="body-sm">
          Bracket <strong>{ageGroup.description}</strong>
        </Typography>
        <Typography color="muted" type="body-sm">
          You {formatRate(ageGroup.contributionRate.employee)} · Employer{" "}
          {formatRate(ageGroup.contributionRate.employer)} · Total{" "}
          {formatRate(
            ageGroup.contributionRate.employee +
              ageGroup.contributionRate.employer,
          )}
        </Typography>
      </Surface>

      <Typography color="muted" type="body-xs">
        Rates from the CPF Board contribution table effective{" "}
        {formatDate(ceilingDate, "d MMMM yyyy")}.
      </Typography>
    </Card>
  );
}
