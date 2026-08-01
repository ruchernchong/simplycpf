"use client";

import {
  Button,
  Card,
  Description,
  FieldError,
  Input,
  Label,
  NumberField,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@heroui/react";
import { FlashIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CPF_CONTRIBUTION_SCHEDULES,
  CPF_INTEREST_FLOOR_RATES,
  CPF_POLICY_RULES,
} from "@/policy";
import type {
  CitizenshipStatus,
  RetirementRouting,
  RetirementTransfer,
  VoluntaryTopUp,
} from "@/types";

const retirementAccountAge =
  CPF_POLICY_RULES.lifecycleAges.retirementAccountCreated;
const specialAccountClosureMonth =
  CPF_POLICY_RULES.specialAccountClosure.effectiveDate.slice(0, 7);
const earliestProjectionMonth =
  CPF_CONTRIBUTION_SCHEDULES[0].effectiveFrom.slice(0, 7);
const maximumProjectionAge =
  CPF_POLICY_RULES.lifecycleAges.latestVoluntaryCpfLifeJoinAgeExclusive;
const selfTaxReliefCap =
  CPF_POLICY_RULES.retirementTopUps.taxRelief.selfAnnualCap;
const propertyLeaseQualifyingAge =
  CPF_POLICY_RULES.age55PropertyPledge.qualifyingLeaseMustLastThroughAge;

export type ProjectionTopUpAccount = "retirement" | "MA";

export interface ProjectionFormValues {
  monthlyIncome: number;
  birthDate: string;
  startMonth: string;
  endAge: number;
  citizenship: CitizenshipStatus;
  permanentResidentSince: string;
  initialOa: number;
  initialSa: number;
  initialMa: number;
  initialRa: number;
  housingWithdrawal: number;
  netSaSavingsWithdrawnForInvestments: number;
  topUpAmount: number;
  topUpAccount: ProjectionTopUpAccount;
  topUpFrequency: VoluntaryTopUp["frequency"];
  transferAmount: number;
  transferTiming: RetirementTransfer["timing"];
  retirementRouting: RetirementRouting;
}

interface ProjectionFormProps {
  values: ProjectionFormValues;
  currentAge: number | null;
  hasValidBirthDate: boolean;
  hasValidStartMonth: boolean;
  hasValidPermanentResidentSince: boolean;
  hasValidRange: boolean;
  hasValidAccountState: boolean;
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

const topUpOptions: {
  label: string;
  value: ProjectionTopUpAccount;
}[] = [
  { label: "Retirement (SA / RA)", value: "retirement" },
  { label: "MediSave (MA)", value: "MA" },
];

const topUpFrequencyOptions: VoluntaryTopUp["frequency"][] = [
  "monthly",
  "yearly",
];

const transferTimingOptions: {
  label: string;
  value: RetirementTransfer["timing"];
}[] = [
  { label: "One-off now", value: "now" },
  { label: "Repeat monthly", value: "monthly" },
  { label: "Repeat yearly", value: "yearly" },
];

const retirementRoutingOptions: {
  label: string;
  value: RetirementRouting;
}[] = [
  { label: "Full Retirement Sum", value: "full-retirement-sum" },
  {
    label: "Basic sum + eligible property",
    value: "basic-retirement-sum-with-property",
  },
];

function isCitizenshipStatus(value: string): value is CitizenshipStatus {
  return citizenshipOptions.some((option) => option.value === value);
}

function isTopUpAccount(value: string): value is ProjectionTopUpAccount {
  return topUpOptions.some((option) => option.value === value);
}

function isTopUpFrequency(value: string): value is VoluntaryTopUp["frequency"] {
  return topUpFrequencyOptions.some((option) => option === value);
}

function isTransferTiming(
  value: string,
): value is RetirementTransfer["timing"] {
  return transferTimingOptions.some((option) => option.value === value);
}

function isRetirementRouting(value: string): value is RetirementRouting {
  return retirementRoutingOptions.some((option) => option.value === value);
}

function CurrencyField({
  label,
  value,
  onChange,
  description,
  isInvalid = false,
  error,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  isInvalid?: boolean;
  error?: string;
}) {
  return (
    <NumberField
      className="flex flex-col gap-2"
      formatOptions={{
        style: "currency",
        currency: "SGD",
        currencyDisplay: "narrowSymbol",
        maximumFractionDigits: 2,
      }}
      isInvalid={isInvalid}
      isRequired
      minValue={0}
      onChange={(next) => onChange(Number.isNaN(next) ? 0 : next)}
      step={100}
      value={value}
    >
      <Label>{label}</Label>
      <NumberField.Group className="w-full grid-cols-1">
        <NumberField.Input className="w-full" />
      </NumberField.Group>
      {isInvalid && error ? <FieldError>{error}</FieldError> : null}
      {!isInvalid && description ? (
        <Description>{description}</Description>
      ) : null}
    </NumberField>
  );
}

export default function ProjectionForm({
  values,
  currentAge,
  hasValidBirthDate,
  hasValidStartMonth,
  hasValidPermanentResidentSince,
  hasValidRange,
  hasValidAccountState,
  isPending,
  onBirthDateChange,
  onChange,
  onReset,
}: ProjectionFormProps) {
  const raIsInvalid =
    currentAge !== null &&
    currentAge < retirementAccountAge &&
    values.initialRa > 0;
  const saIsInvalid =
    currentAge !== null &&
    currentAge >= retirementAccountAge &&
    values.startMonth >= specialAccountClosureMonth &&
    values.initialSa > 0;
  const isPermanentResident = values.citizenship !== "citizen";
  const needsPermanentResidentSince =
    values.citizenship === "spr-year1" || values.citizenship === "spr-year2";

  return (
    <Card>
      <Card.Header>
        <Card.Title>Projection assumptions</Card.Title>
        <Card.Description>
          Enter the balances shown in your CPF statement. A zero is still an
          explicit starting balance.
        </Card.Description>
        <div className="flex items-center gap-2 rounded-md bg-accent/5 px-4 py-2">
          <HugeiconsIcon icon={FlashIcon} className="size-4" strokeWidth={2} />
          <Typography className="text-accent" type="body-xs">
            Uses CPF floor rates: OA {CPF_INTEREST_FLOOR_RATES.OA}% p.a.; SA, MA
            and RA {CPF_INTEREST_FLOOR_RATES.SMRA}% p.a.
          </Typography>
        </div>
      </Card.Header>

      <Card.Content className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <CurrencyField
            label="Gross monthly Ordinary Wages"
            value={values.monthlyIncome}
            onChange={(monthlyIncome) => onChange({ monthlyIncome })}
            description="Held constant; no salary growth or bonus is inferred."
          />

          <TextField
            className="flex flex-col gap-2"
            isInvalid={Boolean(values.birthDate) && !hasValidBirthDate}
            isRequired
            onChange={onBirthDateChange}
            value={values.birthDate}
          >
            <Label>Birth month and year</Label>
            <Input inputMode="numeric" maxLength={7} placeholder="MM/YYYY" />
            {values.birthDate && !hasValidBirthDate ? (
              <FieldError>
                Enter a valid month and year between 1901 and the current year.
              </FieldError>
            ) : null}
            {currentAge !== null ? (
              <Description>Age at projection start: {currentAge}</Description>
            ) : null}
          </TextField>

          <TextField
            className="flex flex-col gap-2"
            isInvalid={Boolean(values.startMonth) && !hasValidStartMonth}
            isRequired
            onChange={(startMonth) => onChange({ startMonth })}
            value={values.startMonth}
          >
            <Label>Projection start month</Label>
            <Input min={earliestProjectionMonth} type="month" />
            {values.startMonth && !hasValidStartMonth ? (
              <FieldError>
                Choose {earliestProjectionMonth} or a later month.
              </FieldError>
            ) : null}
          </TextField>

          <NumberField
            className="flex flex-col gap-2"
            isInvalid={hasValidBirthDate && !hasValidRange}
            isRequired
            maxValue={maximumProjectionAge}
            minValue={Math.max(currentAge ?? 0, 1)}
            onChange={(endAge) =>
              onChange({
                endAge: Number.isNaN(endAge) ? 1 : Math.max(endAge, 1),
              })
            }
            value={values.endAge}
          >
            <Label>Project until age</Label>
            <NumberField.Group className="w-full grid-cols-1">
              <NumberField.Input className="w-full" />
            </NumberField.Group>
            {hasValidBirthDate && !hasValidRange ? (
              <FieldError>
                Choose an end age at or above your start age.
              </FieldError>
            ) : null}
          </NumberField>
        </div>

        <div className="flex flex-col gap-2">
          <Label id="projection-citizenship-label">Citizenship status</Label>
          <ToggleButtonGroup
            aria-labelledby="projection-citizenship-label"
            className="flex flex-wrap gap-2"
            disallowEmptySelection
            isDetached
            onSelectionChange={(keys) => {
              const [next] = Array.from(keys);
              const value = String(next);
              if (isCitizenshipStatus(value)) onChange({ citizenship: value });
            }}
            selectedKeys={[values.citizenship]}
            selectionMode="single"
            size="sm"
          >
            {citizenshipOptions.map((option) => (
              <ToggleButton id={option.value} key={option.value}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        {isPermanentResident ? (
          <TextField
            className="flex flex-col gap-2"
            isInvalid={!hasValidPermanentResidentSince}
            isRequired={needsPermanentResidentSince}
            onChange={(permanentResidentSince) =>
              onChange({ permanentResidentSince })
            }
            value={values.permanentResidentSince}
          >
            <Label>Permanent Resident since</Label>
            <Input max={values.startMonth} type="month" />
            {!hasValidPermanentResidentSince ? (
              <FieldError>
                Enter the SPR conversion month, no later than the projection
                start month.
              </FieldError>
            ) : (
              <Description>
                Used to move from graduated Year 1 to Year 2, then full rates,
                in the month after each anniversary.
              </Description>
            )}
          </TextField>
        ) : null}

        <div className="border-border border-t" />

        <div className="flex flex-col gap-4">
          <div>
            <Typography type="h4">Starting CPF balances</Typography>
            <Typography color="muted" type="body-sm">
              Required so existing savings and age-55 routing are not silently
              omitted.
            </Typography>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <CurrencyField
              label="Ordinary Account (OA)"
              value={values.initialOa}
              onChange={(initialOa) => onChange({ initialOa })}
            />
            <CurrencyField
              label="Special Account (SA)"
              value={values.initialSa}
              onChange={(initialSa) => onChange({ initialSa })}
              isInvalid={saIsInvalid}
              error={`SA is closed for a projection starting at age ${retirementAccountAge} or above after the official closure. Enter this amount in RA or OA as shown on your statement.`}
            />
            <CurrencyField
              label="MediSave Account (MA)"
              value={values.initialMa}
              onChange={(initialMa) => onChange({ initialMa })}
            />
            <CurrencyField
              label="Retirement Account (RA)"
              value={values.initialRa}
              onChange={(initialRa) => onChange({ initialRa })}
              isInvalid={raIsInvalid}
              error={`RA does not exist before age ${retirementAccountAge}.`}
            />
          </div>
          {!hasValidAccountState ? (
            <Typography className="text-accent" type="body-sm">
              Correct the SA or RA starting balance before projecting.
            </Typography>
          ) : null}
        </div>

        <div className="border-border border-t" />

        <div className="grid gap-6 sm:grid-cols-2">
          <CurrencyField
            label="Monthly housing withdrawal from OA"
            value={values.housingWithdrawal}
            onChange={(housingWithdrawal) => onChange({ housingWithdrawal })}
            description="Applied at the start of each month, up to the available OA balance."
          />

          <CurrencyField
            label="Net SA savings withdrawn for investments"
            value={values.netSaSavingsWithdrawnForInvestments}
            onChange={(netSaSavingsWithdrawnForInvestments) =>
              onChange({ netSaSavingsWithdrawnForInvestments })
            }
            description={`Before age ${retirementAccountAge}, this amount counts towards the FRS limit for retirement top-ups and OA transfers. Enter zero if none.`}
          />

          <CurrencyField
            label="Voluntary top-up amount"
            value={values.topUpAmount}
            onChange={(topUpAmount) => onChange({ topUpAmount })}
            description={
              values.topUpAccount === "MA"
                ? "Actual capacity is based on BHS. MediSave tax relief is not estimated without full annual CPF contribution context."
                : `Actual capacity is based on FRS or ERS. S$${selfTaxReliefCap.toLocaleString("en-SG")} is only the annual retirement cash top-up tax-relief cap.`
            }
          />

          <div className="flex flex-col gap-2">
            <Label id="projection-top-up-account-label">
              Top-up destination
            </Label>
            <ToggleButtonGroup
              aria-labelledby="projection-top-up-account-label"
              className="flex flex-wrap gap-2"
              disallowEmptySelection
              isDetached
              onSelectionChange={(keys) => {
                const [next] = Array.from(keys);
                const value = String(next);
                if (isTopUpAccount(value)) onChange({ topUpAccount: value });
              }}
              selectedKeys={[values.topUpAccount]}
              selectionMode="single"
              size="sm"
            >
              {topUpOptions.map((option) => (
                <ToggleButton id={option.value} key={option.value}>
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>

          <div className="flex flex-col gap-2">
            <Label id="projection-top-up-frequency-label">
              Top-up frequency
            </Label>
            <ToggleButtonGroup
              aria-labelledby="projection-top-up-frequency-label"
              className="flex flex-wrap gap-2"
              disallowEmptySelection
              isDetached
              onSelectionChange={(keys) => {
                const [next] = Array.from(keys);
                const value = String(next);
                if (isTopUpFrequency(value))
                  onChange({ topUpFrequency: value });
              }}
              selectedKeys={[values.topUpFrequency]}
              selectionMode="single"
              size="sm"
            >
              {topUpFrequencyOptions.map((frequency) => (
                <ToggleButton id={frequency} key={frequency}>
                  {frequency === "monthly" ? "Monthly" : "Yearly"}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Description>
              Yearly repeats in the projection start month each year.
            </Description>
          </div>

          <CurrencyField
            label="OA retirement transfer"
            value={values.transferAmount}
            onChange={(transferAmount) => onChange({ transferAmount })}
            description={`Moves OA to SA before ${retirementAccountAge} or RA from ${retirementAccountAge}, within the applicable limit.`}
          />

          <div className="flex flex-col gap-2">
            <Label id="projection-transfer-timing-label">Transfer timing</Label>
            <ToggleButtonGroup
              aria-labelledby="projection-transfer-timing-label"
              className="flex flex-wrap gap-2"
              disallowEmptySelection
              isDetached
              onSelectionChange={(keys) => {
                const [next] = Array.from(keys);
                const value = String(next);
                if (isTransferTiming(value))
                  onChange({ transferTiming: value });
              }}
              selectedKeys={[values.transferTiming]}
              selectionMode="single"
              size="sm"
            >
              {transferTimingOptions.map((option) => (
                <ToggleButton id={option.value} key={option.value}>
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Description>
              Yearly repeats in the projection start month each year.
            </Description>
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label id="projection-retirement-routing-label">
              Retirement-sum routing context
            </Label>
            <ToggleButtonGroup
              aria-labelledby="projection-retirement-routing-label"
              className="flex flex-wrap gap-2"
              disallowEmptySelection
              isDetached
              onSelectionChange={(keys) => {
                const [next] = Array.from(keys);
                const value = String(next);
                if (isRetirementRouting(value)) {
                  onChange({ retirementRouting: value });
                }
              }}
              selectedKeys={[values.retirementRouting]}
              selectionMode="single"
              size="sm"
            >
              {retirementRoutingOptions.map((option) => (
                <ToggleButton id={option.value} key={option.value}>
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Description>
              The property branch is only for an eligible Singapore property
              whose remaining lease lasts to at least age{" "}
              {propertyLeaseQualifyingAge}.
            </Description>
          </div>
        </div>
      </Card.Content>

      <Card.Footer className="justify-end">
        <Button variant="outline" onPress={onReset} isDisabled={isPending}>
          Reset assumptions
        </Button>
      </Card.Footer>
    </Card>
  );
}
