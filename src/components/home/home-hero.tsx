"use client";

import {
  Button,
  cn,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  NumberField,
  Select,
  TextField,
} from "@heroui/react";
import { RotateCw } from "lucide-react";
import type { FormEvent, ReactElement } from "react";
import { useEffect, useState } from "react";
import { SplitBar } from "@/components/shared/split-bar";
import { useCpfStore } from "@/hooks/use-cpf-store";
import { calculateCpfContribution } from "@/lib/calculate-cpf-contribution";
import { convertBirthDateToAge } from "@/lib/convert-birth-date-to-age";
import { formatDateInput, isValidDateFormat } from "@/lib/date-utils";
import { findAgeGroup } from "@/lib/find-age-group";
import { formatCurrency } from "@/lib/format";
import {
  selectAgeGroup,
  selectLatestIncomeCeilingDate,
} from "@/stores/selectors";
import type { CitizenshipStatus } from "@/types";

const EXAMPLE = {
  monthlyGrossIncome: 5000,
  birthDate: "03/1994",
  citizenshipStatus: "citizen",
} satisfies HomeInputs;

interface HomeInputs {
  monthlyGrossIncome: number;
  birthDate: string;
  citizenshipStatus: CitizenshipStatus;
}

const citizenshipOptions: { id: CitizenshipStatus; label: string }[] = [
  { id: "citizen", label: "Singapore citizen" },
  { id: "spr-year1", label: "Permanent resident · 1st year" },
  { id: "spr-year2", label: "Permanent resident · 2nd year" },
  { id: "spr-year3-plus", label: "Permanent resident · 3rd year onwards" },
];

function isValidBirthDate(value: string): boolean {
  if (!isValidDateFormat(value)) return false;
  const [month, year] = value.split("/").map(Number);
  const today = new Date();
  return year < today.getFullYear() || month <= today.getMonth() + 1;
}

function currency(value: number): string {
  return formatCurrency(value, Number.isInteger(value) ? 0 : 2);
}

export function HomeHero(): ReactElement {
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState<HomeInputs | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const settings = useCpfStore((state) => state.settings);
  const updateSettings = useCpfStore((state) => state.updateSettings);
  const storeAgeGroup = useCpfStore(selectAgeGroup);
  const ceilingDate = useCpfStore(selectLatestIncomeCeilingDate);

  useEffect(() => setMounted(true), []);

  const hasSavedInputs =
    mounted &&
    settings.monthlyGrossIncome > 0 &&
    Number.isFinite(settings.monthlyGrossIncome) &&
    isValidBirthDate(settings.birthDate);
  const committed = hasSavedInputs ? settings : EXAMPLE;
  const inputs =
    draft ??
    (mounted
      ? {
          monthlyGrossIncome:
            settings.monthlyGrossIncome || EXAMPLE.monthlyGrossIncome,
          birthDate: settings.birthDate || EXAMPLE.birthDate,
          citizenshipStatus: settings.citizenshipStatus,
        }
      : EXAMPLE);
  const incomeInvalid =
    !Number.isFinite(inputs.monthlyGrossIncome) ||
    inputs.monthlyGrossIncome <= 0;
  const birthDateInvalid = !isValidBirthDate(inputs.birthDate);
  const hasChanges =
    inputs.monthlyGrossIncome !== committed.monthlyGrossIncome ||
    inputs.birthDate !== committed.birthDate ||
    inputs.citizenshipStatus !== committed.citizenshipStatus;
  const age = convertBirthDateToAge(committed.birthDate);
  const result = calculateCpfContribution(
    committed.monthlyGrossIncome,
    ceilingDate,
    {
      ageGroup: hasSavedInputs ? storeAgeGroup : findAgeGroup(age),
    },
  );
  const { employee, employer, totalContribution } = result.contribution;
  const takeHome = result.afterCpfContribution;

  function updateDraft(value: Partial<HomeInputs>): void {
    setDraft({ ...inputs, ...value });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSubmitted(true);
    if (incomeInvalid || birthDateInvalid) return;
    updateSettings(inputs);
    setDraft(null);
    setSubmitted(false);
  }

  return (
    <section
      className="home-statement flex flex-col gap-6 md:gap-8"
      aria-labelledby="home-title"
    >
      <header className="flex flex-col gap-4">
        <h1 id="home-title" className="home-title">
          Your CPF, in clearer numbers.
        </h1>
        <p className="home-lede">
          See where your salary goes. Then explore what comes next.
        </p>
      </header>

      <Form
        className="grid grid-cols-2 items-start gap-4 lg:grid-cols-[1fr_1fr_1.3fr_auto] lg:gap-8"
        onSubmit={handleSubmit}
        validationBehavior="aria"
      >
        <NumberField
          className="flex min-w-0 flex-col gap-2"
          name="salary"
          isInvalid={submitted && incomeInvalid}
          formatOptions={{
            style: "currency",
            currency: "SGD",
            currencyDisplay: "narrowSymbol",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }}
          minValue={0}
          step={100}
          value={inputs.monthlyGrossIncome}
          onChange={(value) => updateDraft({ monthlyGrossIncome: value })}
        >
          <Label>Monthly salary</Label>
          <NumberField.Group className="w-full grid-cols-1">
            <NumberField.Input className="w-full" />
          </NumberField.Group>
          {submitted && incomeInvalid && (
            <FieldError>Enter a salary greater than $0.</FieldError>
          )}
        </NumberField>
        <TextField
          className="flex min-w-0 flex-col gap-2"
          name="birthDate"
          value={inputs.birthDate}
          isInvalid={submitted && birthDateInvalid}
          onChange={(value) =>
            updateDraft({ birthDate: formatDateInput(value) })
          }
        >
          <Label>Birth month</Label>
          <Input
            aria-label="Birth month (MM/YYYY)"
            inputMode="numeric"
            maxLength={7}
            placeholder="MM/YYYY"
          />
          {submitted && birthDateInvalid && (
            <FieldError>
              Enter a valid birth month, no later than this month.
            </FieldError>
          )}
        </TextField>
        <Select
          className="col-span-2 flex min-w-0 flex-col gap-2 sm:col-span-1"
          name="residency"
          value={inputs.citizenshipStatus}
          onChange={(value) => {
            const option = citizenshipOptions.find((item) => item.id === value);
            if (option) updateDraft({ citizenshipStatus: option.id });
          }}
        >
          <Label>Residency</Label>
          <Select.Trigger className="w-full">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {citizenshipOptions.map((option) => (
                <ListBox.Item
                  id={option.id}
                  key={option.id}
                  textValue={option.label}
                >
                  {option.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <div className="col-span-2 flex h-full items-end sm:col-span-1">
          <Button type="submit" variant="ghost" className="w-full lg:w-auto">
            <RotateCw aria-hidden className="size-4" />
            Update figures
          </Button>
        </div>
      </Form>

      <div
        className="flex flex-col gap-6"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="home-kicker">
          {hasChanges
            ? "Update figures to apply your changes"
            : hasSavedInputs
              ? `Your figures · Monthly · Age ${age}`
              : `Example figures · Monthly · Citizen, age ${age}`}
        </p>
        <dl className="home-figures">
          <div className="home-figure home-figure--salary">
            <dt>Gross salary</dt>
            <dd className="home-amount">
              {currency(committed.monthlyGrossIncome)}
            </dd>
            <dd className="home-figure-note">Before CPF deductions</dd>
          </div>
          <div className="home-figure home-figure--take-home">
            <dt>Take-home pay</dt>
            <dd className="home-amount">{currency(takeHome)}</dd>
            <dd className="home-figure-note">Paid to your bank</dd>
          </div>
          <div className="home-figure home-figure--cpf">
            <dt>Into your CPF</dt>
            <dd className="home-amount">{currency(totalContribution)}</dd>
            <dd>
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt>From you</dt>
                  <dd>{currency(employee)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-separator border-t py-2">
                  <dt>From your employer</dt>
                  <dd>{currency(employer)}</dd>
                </div>
              </dl>
            </dd>
          </div>
        </dl>
        <div className="flex flex-col gap-4">
          <p className="home-kicker">
            Your {currency(committed.monthlyGrossIncome)} salary
          </p>
          <SplitBar
            size="lg"
            showValues
            formatValue={currency}
            className="home-salary-bar"
            segments={[
              {
                label: "Take-home",
                value: takeHome,
                color: "chart-4",
              },
              {
                label: "Your CPF",
                value: employee,
                color: "chart-2",
              },
            ]}
          />
          <div
            className={cn(
              "flex flex-wrap justify-between gap-2 text-xs",
              employee / committed.monthlyGrossIncome >= 0.15 && "md:hidden",
            )}
            aria-hidden="true"
          >
            <span>Take-home {currency(takeHome)}</span>
            <span>Your CPF {currency(employee)}</span>
          </div>
          <p className="home-figure-note">
            Your employer adds another {currency(employer)} to CPF.
          </p>
        </div>
      </div>
    </section>
  );
}
