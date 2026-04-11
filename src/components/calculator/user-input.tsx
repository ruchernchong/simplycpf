import { HelpCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useAtom, useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";
import { formStepAtom } from "@/atoms/form-step-atom";
import { type ChangeEvent, useCallback, useEffect, useTransition } from "react";
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
    startTransition(() => {
      resetSettings();
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Enter your details for CPF calculation
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
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
                  Your birth date affects your contribution rates
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
                  Your total monthly salary before any deductions
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
              Store input on this browser?
            </Label>
          </div>
          <p className="text-muted-foreground text-xs">
            By ticking the above checkbox, the input will be stored on your own
            browser. No data are being stored on any servers.
          </p>
        </div>

        {step === 1 && (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50 p-4 text-center">
            <p className="text-muted-foreground text-sm">
              Enter your gross monthly income to see your CPF calculations
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={handleReset} disabled={isPending}>
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserInput;
