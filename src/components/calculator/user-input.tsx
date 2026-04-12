import {
  Bookmark02Icon,
  FlashIcon,
  HelpCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useAtom, useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";
import posthog from "posthog-js";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import { formStepAtom } from "@/atoms/form-step-atom";
import { settingsAtom } from "@/atoms/setting-atom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDateInput, isValidDateFormat } from "@/utils/date-utils";

const UserInput = () => {
  const [settings, setSettings] = useAtom(settingsAtom);
  const { birthDate, monthlyGrossIncome, shouldStoreInput } = settings;
  const [isPending, startTransition] = useTransition();
  const step = useAtomValue(formStepAtom);

  const resetSettings = useResetAtom(settingsAtom);

  useEffect(() => {
    if (!shouldStoreInput) {
      resetSettings();
    }
  }, [resetSettings, shouldStoreInput]);

  const handleBirthDateChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const rawInput = event.target.value;
      const formattedBirthDate = formatDateInput(rawInput, birthDate);

      startTransition(() => {
        void setSettings((setting) => ({
          ...setting,
          birthDate: formattedBirthDate,
        }));
      });
    },
    [birthDate, setSettings],
  );

  const handleReset = () => {
    posthog.capture("calculator_reset");
    startTransition(() => {
      resetSettings();
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

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Your Details</CardTitle>
        <CardDescription>
          Just two inputs for your full CPF breakdown
        </CardDescription>
        <p className="text-muted-foreground text-xs">
          Your inputs stay in your browser — nothing is sent to any server.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center gap-2 rounded-md bg-accent/5 px-3 py-2 text-accent text-xs">
          <HugeiconsIcon
            icon={FlashIcon}
            className="size-3.5"
            strokeWidth={2}
          />
          Results update instantly as you type
        </div>
        {/* Birth Date Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="birthDate">Birth month and year</Label>
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
                  Your age group (out of 8 brackets) determines how much goes
                  into each CPF account
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
            className={
              !isValidDateFormat(birthDate) && birthDate
                ? "border-accent focus-visible:ring-accent"
                : ""
            }
          />
          {!isValidDateFormat(birthDate) && birthDate && (
            <p className="text-accent text-xs">
              Please enter a valid date in MM/YYYY format
            </p>
          )}
        </div>

        {/* Gross Income Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="grossIncome">Gross Monthly Income</Label>
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
            placeholder="0.00"
            value={monthlyGrossIncome || ""}
            onChange={(e) =>
              setSettings((setting) => ({
                ...setting,
                monthlyGrossIncome: Number.parseFloat(e.target.value) || 0,
              }))
            }
            className="max-w-xs"
            min={0}
          />
        </div>

        {/* Remember Input Checkbox */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={shouldStoreInput}
              onCheckedChange={(checked) =>
                startTransition(() => {
                  setSettings((setting) => ({
                    ...setting,
                    shouldStoreInput: Boolean(checked),
                  }));
                })
              }
              disabled={isPending}
            />
            <Label htmlFor="remember" className="text-sm">
              Remember my inputs on this browser
            </Label>
          </div>
          <p className="text-muted-foreground text-xs">
            Your inputs stay on your browser only — nothing is sent to any
            server.
          </p>
        </div>

        {step === 1 && (
          <div className="rounded-lg border border-muted-foreground/30 border-dashed bg-muted/50 p-4 text-center">
            <p className="text-muted-foreground text-sm">
              Enter your gross monthly income to see your CPF calculations
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        {monthlyGrossIncome > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleCopyCalcLink}
            title="Copy a link that saves your inputs — no sign-up needed"
          >
            <HugeiconsIcon
              icon={Bookmark02Icon}
              className="size-4"
              strokeWidth={2}
            />
            {linkCopied ? "Link copied!" : "Save calculation"}
          </Button>
        )}
        <Button variant="outline" onClick={handleReset} disabled={isPending}>
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserInput;
