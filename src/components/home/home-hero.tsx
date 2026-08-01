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
  Surface,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@heroui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getWageBandCopy } from "@/components/calculator/figures";
import { Eyebrow } from "@/components/shared/section-header";
import { SplitBar } from "@/components/shared/split-bar";
import { useCpfStore } from "@/hooks/use-cpf-store";
import { calculateCpfContribution } from "@/lib/calculate-cpf-contribution";
import {
  convertBirthDateToAge,
  convertBirthDateToBirthMonth,
} from "@/lib/convert-birth-date-to-age";
import { findAgeGroup } from "@/lib/find-age-group";
import { formatCurrency } from "@/lib/format";
import { CPF_POLICY_CATALOGUE, resolveContributionSchedule } from "@/policy";
import {
  selectAgeGroup,
  selectLatestIncomeCeilingDate,
} from "@/stores/selectors";
import type { AgeGroup, CitizenshipStatus } from "@/types";
import { formatDateInput, isValidDateFormat } from "@/utils/date-utils";

/** Illustrative figures shown before anyone types anything. */
const EXAMPLE_INCOME = 5000;
const EXAMPLE_AGE = 32;

const citizenshipOptions: { id: CitizenshipStatus; label: string }[] = [
  { id: "citizen", label: "Citizen" },
  { id: "spr-year1", label: "PR 1st yr" },
  { id: "spr-year2", label: "PR 2nd" },
  { id: "spr-year3-plus", label: "PR 3rd+" },
];

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
  const schedule = resolveContributionSchedule(ceilingDate).schedule;
  const interest = CPF_POLICY_CATALOGUE.interestRateMethodology;
  const lifecycleAges = CPF_POLICY_CATALOGUE.rules.lifecycleAges;
  const accountMeta: Record<string, { note: string; fill: string }> = {
    OA: {
      note: `housing, loans · ${interest.ordinaryAccount.floorRate.toFixed(2)}% floor`,
      fill: "bg-chart-1",
    },
    SA: {
      note: `retirement · ${interest.specialMediSaveRetirementAccounts.floorRate.toFixed(2)}% floor`,
      fill: "bg-chart-2",
    },
    RA: {
      note: `retirement · ${interest.specialMediSaveRetirementAccounts.floorRate.toFixed(2)}% floor`,
      fill: "bg-chart-2",
    },
    MA: {
      note: `healthcare · ${interest.specialMediSaveRetirementAccounts.floorRate.toFixed(2)}% floor`,
      fill: "bg-chart-3",
    },
  };

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

  const birthMonth = convertBirthDateToBirthMonth(birthDate);
  const calculationBase = {
    contributionMonth: CPF_POLICY_CATALOGUE.metadata[
      "cpf-contribution-rates"
    ].verifiedAt.slice(0, 7),
    ordinaryWages: gross,
    citizenship: mounted ? citizenshipStatus : "citizen",
  };
  const result = calculateCpfContribution(
    hasBirthDate && birthMonth
      ? { ...calculationBase, birthMonth }
      : { ...calculationBase, age },
  );
  const { employee, employer, totalContribution } = result.contribution;
  const takeHome = result.afterCpfContribution;
  const totalPackage = gross + employer;
  const wageBandCopy = getWageBandCopy(result.wageBand);
  const undeterminedRouting =
    result.routing?.selected === "undetermined" ? result.routing : undefined;
  const hasUndeterminedRouting = undeterminedRouting !== undefined;

  const accounts = hasUndeterminedRouting
    ? []
    : Object.entries(result.distribution).map(([key, value]) => ({
        key,
        value,
        ...accountMeta[key],
      }));
  const routingBranches = undeterminedRouting
    ? [
        {
          key: "before-frs",
          title: "Before FRS is set aside",
          body: "The retirement allocation goes to RA.",
          distribution: undeterminedRouting.branches.beforeFullRetirementSum,
        },
        {
          key: "after-frs",
          title: "After FRS is set aside",
          body: "The retirement allocation goes to OA instead.",
          distribution: undeterminedRouting.branches.afterFullRetirementSum,
        },
      ]
    : [];

  return (
    <section className="grid gap-14 lg:grid-cols-[1.02fr_0.98fr]">
      <div className="flex flex-col gap-6">
        <Eyebrow withDot>
          Updated for the {schedule.effectiveFrom.slice(0, 4)} schedule
        </Eyebrow>
        <Typography className="text-balance" type="h1">
          Five questions about CPF, answered in plain English.
        </Typography>
        <Typography className="max-w-[47ch] text-pretty" color="muted">
          Where this month&rsquo;s money went. What happens at{" "}
          {lifecycleAges.retirementAccountCreated}. What a flat really costs
          your OA. What can arrive every month from{" "}
          {lifecycleAges.cpfLifePayoutEligibility}. No sign-up, no jargon, no
          advice, just the arithmetic, with every assumption shown.
        </Typography>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Card variant="secondary" className="flex-[1.3]">
            <Card.Content>
              <NumberField
                fullWidth
                aria-label="Monthly Ordinary Wages"
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
                <Label>Monthly Ordinary Wages</Label>
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
                <Label>Date of birth (MM/YYYY)</Label>
                <Input
                  className="w-full"
                  inputMode="numeric"
                  maxLength={7}
                  placeholder="03/1994"
                />
              </TextField>
              <div className="flex flex-col">
                <Typography type="h2">{age}</Typography>
                <Typography color="muted" type="body-xs">
                  {ageGroup.description}
                </Typography>
              </div>
            </Card.Content>
          </Card>
        </div>

        <div className="flex flex-col gap-2">
          <Typography color="muted" type="body-xs" weight="medium">
            Citizenship
          </Typography>
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

        <Typography className="max-w-[54ch]" color="muted" type="body-xs">
          Nothing leaves your browser. SimplyCPF is independent and not
          affiliated with the CPF Board. Every figure is an estimate from
          published rates, not financial advice.
        </Typography>
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

          <Typography className="text-pretty">
            You keep <strong>{currency(takeHome)}</strong> of your{" "}
            {currency(gross)} salary.{" "}
            <strong>{currency(totalContribution)}</strong> goes into your CPF
            accounts, and only {currency(employee)} of that came out of your
            pay.
          </Typography>

          <div className="flex flex-wrap items-center gap-2">
            <Chip size="sm" variant="tertiary">
              <Chip.Label>{wageBandCopy.label}</Chip.Label>
            </Chip>
            <Typography color="muted" type="body-xs">
              {wageBandCopy.description}
            </Typography>
          </div>

          {result.warnings.length > 0 && (
            <Surface className="rounded-2xl p-4" variant="tertiary">
              <div className="flex flex-col gap-2">
                {result.warnings.map((warning) => (
                  <Typography key={warning.code} type="body-xs">
                    {warning.message}
                  </Typography>
                ))}
              </div>
            </Surface>
          )}

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
            <div className="flex justify-between gap-4">
              <Typography color="muted" type="body-xs">
                {currency(takeHome)} in your bank
              </Typography>
              <Typography color="muted" type="body-xs">
                {currency(totalPackage)} total value of the month
              </Typography>
            </div>
          </div>

          <Separator />

          {hasUndeterminedRouting ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {routingBranches.map((branch) => (
                <Surface
                  className="flex flex-col gap-4 rounded-2xl p-4"
                  key={branch.key}
                  variant="tertiary"
                >
                  <div className="flex flex-col gap-2">
                    <Typography type="body-sm" weight="semibold">
                      {branch.title}
                    </Typography>
                    <Typography color="muted" type="body-xs">
                      {branch.body}
                    </Typography>
                  </div>
                  <div className="flex flex-col gap-2">
                    {Object.entries(branch.distribution).map(([key, value]) => (
                      <div className="flex justify-between gap-4" key={key}>
                        <Typography color="muted" type="body-xs">
                          {key}
                        </Typography>
                        <Typography type="body-xs" weight="semibold">
                          {formatCurrency(value)}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </Surface>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {accounts.map((account) => (
                <Meter
                  key={account.key}
                  aria-label={`${account.key} share of this month's CPF`}
                  className="flex flex-col gap-2"
                  valueLabel={formatCurrency(account.value)}
                  value={
                    totalContribution > 0
                      ? (account.value / totalContribution) * 100
                      : 0
                  }
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <Label>
                      {account.key} · {account.note}
                    </Label>
                    <Meter.Output />
                  </div>
                  <Meter.Track className="h-1.5 rounded-full bg-foreground/10">
                    <Meter.Fill className={cn("h-1.5", account.fill)} />
                  </Meter.Track>
                </Meter>
              ))}
            </div>
          )}

          <Link href="/calculator" className="link text-[13px]">
            See the full breakdown and the ceiling comparison →
          </Link>
        </Card.Content>
      </Card>
    </section>
  );
}
