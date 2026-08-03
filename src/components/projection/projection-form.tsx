"use client";

import {
  Button,
  Card,
  Input,
  Label,
  NumberField,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react";
import { FlashIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type {
  CitizenshipStatus,
  OaToSaTransfer,
  VoluntaryTopUp,
} from "@/types";

export interface ProjectionFormValues {
  monthlyIncome: number;
  birthDate: string;
  endAge: number;
  citizenship: CitizenshipStatus;
  housingWithdrawal: number;
  topUpAmount: number;
  topUpAccount: VoluntaryTopUp["account"];
  transferAmount: number;
  transferTiming: OaToSaTransfer["timing"];
}

interface ProjectionFormProps {
  values: ProjectionFormValues;
  currentAge: number | null;
  hasValidBirthDate: boolean;
  hasValidRange: boolean;
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

const topUpAccounts: VoluntaryTopUp["account"][] = ["SA", "MA", "RA"];

const transferTimingOptions: {
  label: string;
  value: OaToSaTransfer["timing"];
}[] = [
  { label: "One-off now", value: "now" },
  { label: "Repeat yearly", value: "yearly" },
];

function isCitizenshipStatus(value: string | null): value is CitizenshipStatus {
  return citizenshipOptions.some((option) => option.value === value);
}

function isTopUpAccount(
  value: string | null,
): value is VoluntaryTopUp["account"] {
  return topUpAccounts.some((account) => account === value);
}

function isTransferTiming(
  value: string | null,
): value is OaToSaTransfer["timing"] {
  return transferTimingOptions.some((option) => option.value === value);
}

export default function ProjectionForm({
  values,
  currentAge,
  hasValidBirthDate,
  hasValidRange,
  isPending,
  onBirthDateChange,
  onChange,
  onReset,
}: ProjectionFormProps) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Projection Assumptions</Card.Title>
        <Card.Description>
          Start with your income and birth month, then adjust optional CPF
          planning moves.
        </Card.Description>
        <div className="flex items-center gap-2 rounded-md bg-accent/5 px-4 py-2 text-accent text-xs">
          <HugeiconsIcon
            icon={FlashIcon}
            className="size-3.5"
            strokeWidth={2}
          />
          Uses conservative floor rates: OA 2.5% p.a., SA/MA/RA 4.0% p.a.
        </div>
      </Card.Header>
      <Card.Content className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <NumberField
            className="flex flex-col gap-2"
            formatOptions={{
              style: "currency",
              currency: "SGD",
              currencyDisplay: "narrowSymbol",
              maximumFractionDigits: 0,
            }}
            minValue={0}
            onChange={(value) =>
              onChange({ monthlyIncome: Number.isNaN(value) ? 0 : value })
            }
            step={100}
            value={values.monthlyIncome}
          >
            <Label>Gross monthly income</Label>
            <NumberField.Group className="w-full grid-cols-1">
              <NumberField.Input className="w-full" />
            </NumberField.Group>
          </NumberField>

          <TextField
            className="flex flex-col gap-2"
            isInvalid={Boolean(values.birthDate) && !hasValidBirthDate}
            onChange={onBirthDateChange}
            value={values.birthDate}
          >
            <Label>Birth month and year</Label>
            <Input inputMode="numeric" maxLength={7} placeholder="MM/YYYY" />
            {values.birthDate && !hasValidBirthDate ? (
              <span className="text-danger text-xs">
                Enter a valid month and year between 1901 and the current year.
              </span>
            ) : null}
            {currentAge !== null ? (
              <span className="text-muted text-xs">
                Current age: {currentAge}
              </span>
            ) : null}
          </TextField>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label id="projection-citizenship-label">Citizenship status</Label>
            <ToggleButtonGroup
              aria-labelledby="projection-citizenship-label"
              className="flex flex-wrap gap-2"
              disallowEmptySelection
              isDetached
              onSelectionChange={(keys) => {
                const [next] = Array.from(keys);
                if (isCitizenshipStatus(String(next))) {
                  onChange({ citizenship: next as CitizenshipStatus });
                }
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

          <NumberField
            className="flex flex-col gap-2"
            maxValue={80}
            minValue={Math.max(currentAge ?? 0, 1)}
            onChange={(value) =>
              onChange({ endAge: Number.isNaN(value) ? 1 : Math.max(value, 1) })
            }
            value={values.endAge}
          >
            <Label>Project until age</Label>
            <NumberField.Group className="w-full grid-cols-1">
              <NumberField.Input className="w-full" />
            </NumberField.Group>
            {hasValidBirthDate && !hasValidRange ? (
              <span className="text-danger text-xs">
                Choose an end age above your current age.
              </span>
            ) : null}
          </NumberField>
        </div>

        <div className="border-border border-t" />

        <div className="grid gap-6 sm:grid-cols-2">
          <NumberField
            className="flex flex-col gap-2"
            formatOptions={{
              style: "currency",
              currency: "SGD",
              currencyDisplay: "narrowSymbol",
              maximumFractionDigits: 0,
            }}
            minValue={0}
            onChange={(value) =>
              onChange({ housingWithdrawal: Number.isNaN(value) ? 0 : value })
            }
            step={100}
            value={values.housingWithdrawal}
          >
            <Label>Monthly housing withdrawal from OA</Label>
            <NumberField.Group className="w-full grid-cols-1">
              <NumberField.Input className="w-full" />
            </NumberField.Group>
            <span className="text-muted text-xs">
              Use this if you regularly use OA for your housing loan.
            </span>
          </NumberField>

          <NumberField
            className="flex flex-col gap-2"
            formatOptions={{
              style: "currency",
              currency: "SGD",
              currencyDisplay: "narrowSymbol",
              maximumFractionDigits: 0,
            }}
            minValue={0}
            onChange={(value) =>
              onChange({ topUpAmount: Number.isNaN(value) ? 0 : value })
            }
            step={500}
            value={values.topUpAmount}
          >
            <Label>Annual voluntary top-up</Label>
            <NumberField.Group className="w-full grid-cols-1">
              <NumberField.Input className="w-full" />
            </NumberField.Group>
            <span className="text-muted text-xs">
              The current model treats this as a yearly top-up and caps tax
              relief at S$8,000.
            </span>
          </NumberField>

          <div className="flex flex-col gap-2">
            <Label id="projection-top-up-account-label">Top-up account</Label>
            <ToggleButtonGroup
              aria-labelledby="projection-top-up-account-label"
              className="flex flex-wrap gap-2"
              disallowEmptySelection
              isDetached
              onSelectionChange={(keys) => {
                const [next] = Array.from(keys);
                if (isTopUpAccount(String(next))) {
                  onChange({
                    topUpAccount: next as VoluntaryTopUp["account"],
                  });
                }
              }}
              selectedKeys={[values.topUpAccount]}
              selectionMode="single"
              size="sm"
            >
              {topUpAccounts.map((account) => (
                <ToggleButton id={account} key={account}>
                  {account}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>

          <NumberField
            className="flex flex-col gap-2"
            formatOptions={{
              style: "currency",
              currency: "SGD",
              currencyDisplay: "narrowSymbol",
              maximumFractionDigits: 0,
            }}
            minValue={0}
            onChange={(value) =>
              onChange({ transferAmount: Number.isNaN(value) ? 0 : value })
            }
            step={1000}
            value={values.transferAmount}
          >
            <Label>OA to SA transfer</Label>
            <NumberField.Group className="w-full grid-cols-1">
              <NumberField.Input className="w-full" />
            </NumberField.Group>
          </NumberField>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label id="projection-transfer-timing-label">Transfer timing</Label>
            <ToggleButtonGroup
              aria-labelledby="projection-transfer-timing-label"
              className="flex flex-wrap gap-2"
              disallowEmptySelection
              isDetached
              onSelectionChange={(keys) => {
                const [next] = Array.from(keys);
                if (isTransferTiming(String(next))) {
                  onChange({
                    transferTiming: next as OaToSaTransfer["timing"],
                  });
                }
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
