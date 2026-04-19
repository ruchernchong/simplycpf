import {
  ArrowRight02Icon,
  Bookmark02Icon,
  HelpCircleIcon,
  Passport01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import posthog from "posthog-js";
import { type ChangeEvent, useCallback, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CPF_INCOME_CEILING } from "@/constants";
import { useCpfStore } from "@/hooks/use-cpf-store";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  selectFormStep,
  selectLatestIncomeCeilingDate,
} from "@/stores/selectors";
import type { Settings } from "@/types";
import { formatDateInput, isValidDateFormat } from "@/utils/date-utils";

const citizenshipOptions = [
  { value: "citizen", label: "Singapore Citizen" },
  { value: "spr-year1", label: "Permanent Resident (Year 1)" },
  { value: "spr-year2", label: "Permanent Resident (Year 2)" },
  { value: "spr-year3-plus", label: "Permanent Resident (Year 3+)" },
];

const ceilingPeriodOptions = Object.entries(CPF_INCOME_CEILING)
  .reverse()
  .map(([date, value]) => ({
    value: date,
    label: `From ${formatDate(date, "MMM yyyy")} (monthly ceiling: ${formatCurrency(value, 0)})`,
  }));

const SCROLL_TARGET_ID = "calculator-results";

const UserInput = () => {
  const [isPending, startTransition] = useTransition();
  const step = useCpfStore(selectFormStep);

  const birthDate = useCpfStore((state) => state.settings.birthDate);
  const monthlyGrossIncome = useCpfStore(
    (state) => state.settings.monthlyGrossIncome,
  );
  const shouldStoreInput = useCpfStore(
    (state) => state.settings.shouldStoreInput,
  );
  const citizenshipStatus = useCpfStore(
    (state) => state.settings.citizenshipStatus,
  );
  const ceilingDate = useCpfStore(selectLatestIncomeCeilingDate);
  const setCeilingDate = useCpfStore(
    (state) => state.setLatestIncomeCeilingDate,
  );

  const updateSettings = useCpfStore((state) => state.updateSettings);

  const handleBirthDateChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const rawInput = event.target.value;
      const formattedBirthDate = formatDateInput(rawInput, birthDate);

      startTransition(() => {
        updateSettings({ birthDate: formattedBirthDate });
      });
    },
    [birthDate, updateSettings],
  );

  const handleReset = () => {
    posthog.capture("calculator_reset");
    startTransition(() => {
      updateSettings({
        birthDate: "",
        monthlyGrossIncome: 0,
        citizenshipStatus: "citizen",
        shouldStoreInput: false,
      });
    });
  };

  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyCalcLink = async () => {
    const url = new URL(globalThis.window?.location.href ?? "");
    url.searchParams.set("income", String(monthlyGrossIncome));
    if (birthDate) url.searchParams.set("dob", birthDate);
    try {
      await navigator.clipboard.writeText(url.toString());
      posthog.capture("calculator_link_copied", {
        has_birth_date: !!birthDate,
      });
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
  };

  const handleViewEstimate = () => {
    posthog.capture("calculator_view_estimate", {
      step,
    });
    if (typeof globalThis.document !== "undefined") {
      const target = globalThis.document.getElementById(SCROLL_TARGET_ID);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      aria-labelledby="user-input-heading"
      className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="user-input-heading"
          className="font-semibold text-[16px] text-foreground"
        >
          Your salary details
        </h2>
        <p className="text-muted-foreground text-xs">
          Inputs stay in your browser — nothing is sent to any server.
        </p>
      </div>

      {/* Gross Income Input */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="grossIncome">Gross Monthly Salary (SGD)</Label>
          <Tooltip>
            <TooltipTrigger className="cursor-help">
              <HugeiconsIcon
                icon={HelpCircleIcon}
                className="size-4 text-muted-foreground"
                strokeWidth={2}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Your total salary before CPF contributions
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          id="grossIncome"
          type="number"
          placeholder="$ 0.00"
          value={monthlyGrossIncome || ""}
          onChange={(e) =>
            updateSettings({
              monthlyGrossIncome: Number.parseFloat(e.target.value) || 0,
            })
          }
          min={0}
          inputMode="decimal"
        />
      </div>

      {/* Birth Date Input */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="birthDate">Date of Birth (CPF age band)</Label>
          <Tooltip>
            <TooltipTrigger className="cursor-help">
              <HugeiconsIcon
                icon={HelpCircleIcon}
                className="size-4 text-muted-foreground"
                strokeWidth={2}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Your age group (out of 8 brackets) determines how much goes into
                each CPF account
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          type="text"
          id="birthDate"
          name="dateOfBirth"
          placeholder="MM/YYYY"
          maxLength={7}
          value={birthDate}
          onChange={handleBirthDateChange}
          className={cn(
            !isValidDateFormat(birthDate) &&
              birthDate &&
              "border-accent focus-visible:ring-accent",
          )}
        />
        {!isValidDateFormat(birthDate) && birthDate && (
          <p className="text-accent text-xs">
            Please enter a valid date in MM/YYYY format
          </p>
        )}
      </div>

      {/* Citizenship Status Select */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="citizenshipStatus">Citizenship Status</Label>
          <Tooltip>
            <TooltipTrigger className="cursor-help">
              <HugeiconsIcon
                icon={Passport01Icon}
                className="size-4 text-muted-foreground"
                strokeWidth={2}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                PRs pay graduated CPF rates during their first 2 years. Year 3+
                uses the same rates as citizens.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Select
          items={citizenshipOptions}
          value={citizenshipStatus}
          onValueChange={(value) =>
            updateSettings({
              citizenshipStatus: value as Settings["citizenshipStatus"],
            })
          }
        >
          <SelectTrigger className="w-full">
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

      {/* Income Ceiling Period Select */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="ceilingPeriod">Income Ceiling Period</Label>
        <Select
          items={ceilingPeriodOptions}
          value={ceilingDate}
          onValueChange={(value) => {
            if (!value) return;
            startTransition(() => setCeilingDate(value));
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ceilingPeriodOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        size="lg"
        className="w-full gap-2"
        onClick={handleViewEstimate}
        disabled={isPending}
      >
        View CPF Estimate
        <HugeiconsIcon
          icon={ArrowRight02Icon}
          className="size-4"
          aria-hidden="true"
        />
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-2 border-border border-t text-muted-foreground text-xs">
        <Label
          htmlFor="remember"
          className="flex cursor-pointer items-center gap-2"
        >
          <Checkbox
            id="remember"
            checked={shouldStoreInput}
            onCheckedChange={(checked) =>
              startTransition(() =>
                updateSettings({ shouldStoreInput: Boolean(checked) }),
              )
            }
            disabled={isPending}
          />
          <span className="text-[12px]">Remember my inputs</span>
        </Label>
        <div className="flex items-center gap-2">
          {monthlyGrossIncome > 0 && (
            <button
              type="button"
              onClick={handleCopyCalcLink}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] hover:text-foreground"
            >
              <HugeiconsIcon
                icon={Bookmark02Icon}
                className="size-3.5"
                strokeWidth={2}
              />
              {linkCopied ? "Link copied" : "Save link"}
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="rounded-md px-2 py-1 text-[12px] hover:text-foreground"
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
};

export default UserInput;
