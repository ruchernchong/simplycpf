"use client";

import {
  Card,
  Chip,
  cn,
  Input,
  Label,
  Meter,
  NumberField,
  Separator,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Eyebrow } from "@/components/shared/section-header";
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
import type { AgeGroup, CitizenshipStatus } from "@/types";

/** Illustrative figures shown before anyone types anything. */
const EXAMPLE_INCOME = 5000;
const EXAMPLE_AGE = 32;

const EYEBROW_LABEL =
  "font-mono text-[10px] text-muted uppercase tracking-[0.12em]";

const citizenshipOptions: { id: CitizenshipStatus; label: string }[] = [
  { id: "citizen", label: "Citizen" },
  { id: "spr-year1", label: "PR 1st yr" },
  { id: "spr-year2", label: "PR 2nd" },
  { id: "spr-year3-plus", label: "PR 3rd+" },
];

const accountMeta: Record<string, { note: string; fill: string }> = {
  OA: { note: "housing, loans · 2.50%", fill: "bg-chart-1" },
  SA: { note: "retirement · 4.00%", fill: "bg-chart-2" },
  RA: { note: "retirement · 4.00%", fill: "bg-chart-2" },
  MA: { note: "healthcare · 4.00%", fill: "bg-chart-3" },
};

function currency(value: number): string {
  return formatCurrency(value, 0);
}

export function HomeHero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const birthDate = useCpfStore((state) => state.settings.birthDate);
  const monthlyGrossIncome = useCpfStore(
    (state) => state.settings.monthlyGrossIncome,
  );
  const citizenshipStatus = useCpfStore(
    (state) => state.settings.citizenshipStatus,
  );
  const storeAgeGroup = useCpfStore(selectAgeGroup);
  const ceilingDate = useCpfStore(selectLatestIncomeCeilingDate);

  const setIncome = useCpfStore((state) => state.setIncome);
  const setBirthDate = useCpfStore((state) => state.setBirthDate);
  const setCitizenshipStatus = useCpfStore(
    (state) => state.setCitizenshipStatus,
  );

  const hasBirthDate = mounted && isValidDateFormat(birthDate);
  const hasIncome = mounted && monthlyGrossIncome > 0;

  const age = hasBirthDate ? convertBirthDateToAge(birthDate) : EXAMPLE_AGE;
  const ageGroup: AgeGroup = hasBirthDate
    ? storeAgeGroup
    : findAgeGroup(EXAMPLE_AGE);
  const gross = hasIncome ? monthlyGrossIncome : EXAMPLE_INCOME;
  const isExample = !(hasBirthDate && hasIncome);

  const result = calculateCpfContribution(gross, ceilingDate, { ageGroup });
  const { employee, employer, totalContribution } = result.contribution;
  const takeHome = result.afterCpfContribution;
  const totalPackage = gross + employer;

  const accounts = Object.entries(result.distribution).map(([name, value]) => {
    const key = name === "SA" && age >= 55 ? "RA" : name;
    return { key, value, ...accountMeta[key] };
  });

  return (
    <section className="grid gap-14 lg:grid-cols-[1.02fr_0.98fr]">
      <div className="flex flex-col gap-6">
        <Eyebrow withDot>Updated for 1 Jan 2026 rates</Eyebrow>
        <h1 className="text-balance font-semibold text-5xl tracking-tight md:text-6xl">
          Five questions about CPF, answered in plain English.
        </h1>
        <p className="max-w-[47ch] text-pretty text-[17.5px] text-muted leading-relaxed">
          Where this month&rsquo;s money went. What happens at 55. What a flat
          really costs your OA. What arrives every month at 65. No sign-up, no
          jargon, no advice, just the arithmetic, with every assumption shown.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Card variant="secondary" className="flex-[1.3]">
            <Card.Content>
              <NumberField
                fullWidth
                aria-label="Monthly salary"
                className="flex flex-col gap-2"
                formatOptions={{
                  style: "currency",
                  currency: "SGD",
                  currencyDisplay: "narrowSymbol",
                  maximumFractionDigits: 0,
                }}
                minValue={0}
                step={100}
                value={hasIncome ? monthlyGrossIncome : EXAMPLE_INCOME}
                onChange={(value) => setIncome(value ?? 0)}
              >
                <Label className={EYEBROW_LABEL}>Monthly salary</Label>
                <NumberField.Group className="h-auto w-full grid-cols-1">
                  <NumberField.Input className="w-full font-semibold text-2xl leading-tight tracking-tight" />
                </NumberField.Group>
              </NumberField>
            </Card.Content>
          </Card>

          <Card variant="secondary" className="flex-[0.7]">
            <Card.Content className="flex flex-col gap-4">
              <TextField
                fullWidth
                className="flex flex-col gap-2"
                isInvalid={
                  mounted &&
                  birthDate.length > 0 &&
                  !isValidDateFormat(birthDate)
                }
                value={mounted ? birthDate : ""}
                onChange={(value) =>
                  setBirthDate(formatDateInput(value, birthDate))
                }
              >
                <Label className={EYEBROW_LABEL}>Date of birth (MM/YYYY)</Label>
                <Input
                  className="w-full"
                  inputMode="numeric"
                  maxLength={7}
                  placeholder="03/1994"
                />
              </TextField>
              <div className="flex flex-col">
                <span className="font-semibold text-[28px] tracking-tight">
                  {age}
                </span>
                <span className="text-muted text-xs">
                  {ageGroup.description}
                </span>
              </div>
            </Card.Content>
          </Card>
        </div>

        <div className="flex flex-col gap-2">
          <span className={EYEBROW_LABEL}>Citizenship</span>
          <ToggleButtonGroup
            disallowEmptySelection
            aria-label="Citizenship status"
            selectedKeys={[mounted ? citizenshipStatus : "citizen"]}
            selectionMode="single"
            size="sm"
            onSelectionChange={(keys) => {
              const [selected] = Array.from(keys);
              if (selected) {
                setCitizenshipStatus(selected as CitizenshipStatus);
              }
            }}
          >
            {citizenshipOptions.map((option, index) => (
              <ToggleButton key={option.id} id={option.id}>
                {index > 0 && <ToggleButtonGroup.Separator />}
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        <p className="max-w-[54ch] text-muted text-xs leading-relaxed">
          Nothing leaves your browser. SimplyCPF is independent and not
          affiliated with the CPF Board. Every figure is an estimate from
          published rates, not financial advice.
        </p>
      </div>

      <Card className="h-fit shadow-(--overlay-shadow)">
        <Card.Content className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Eyebrow>The short answer</Eyebrow>
            {isExample && (
              <Chip size="sm" variant="soft">
                <Chip.Label>
                  Example: {currency(EXAMPLE_INCOME)} a month, age {EXAMPLE_AGE}
                </Chip.Label>
              </Chip>
            )}
          </div>

          <p className="text-pretty text-[19px] leading-[1.45]">
            You keep <span className="font-semibold">{currency(takeHome)}</span>{" "}
            of your {currency(gross)} salary.{" "}
            <span className="font-semibold">{currency(totalContribution)}</span>{" "}
            goes into your CPF accounts, and only {currency(employee)} of that
            came out of your pay.
          </p>

          <div className="flex flex-col gap-2">
            <SplitBar
              formatValue={currency}
              size="lg"
              segments={[
                { label: "Take-home", value: takeHome, color: "chart-4" },
                { label: "You", value: employee, color: "chart-2" },
                { label: "Employer", value: employer, color: "chart-3" },
              ]}
            />
            <div className="flex justify-between gap-4 text-muted text-xs">
              <span>{currency(takeHome)} in your bank</span>
              <span>{currency(totalPackage)} total value of the month</span>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-4">
            {accounts.map((account) => (
              <Meter
                key={account.key}
                aria-label={`${account.key} share of this month's CPF`}
                className="flex flex-col gap-2"
                value={
                  totalContribution > 0
                    ? (account.value / totalContribution) * 100
                    : 0
                }
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{account.key}</span>
                    <span className="text-muted text-xs">{account.note}</span>
                  </span>
                  <span className="font-semibold text-sm">
                    {formatCurrency(account.value)}
                  </span>
                </div>
                <Meter.Track className="h-1.5 rounded-full bg-foreground/10">
                  <Meter.Fill className={cn("h-1.5", account.fill)} />
                </Meter.Track>
              </Meter>
            ))}
          </div>

          <Link href="/calculator" className="link text-[13px]">
            See the full breakdown and the ceiling comparison →
          </Link>
        </Card.Content>
      </Card>
    </section>
  );
}
