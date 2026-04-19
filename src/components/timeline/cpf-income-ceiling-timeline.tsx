"use client";

import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CPF_INCOME_CEILING } from "@/constants";
import { useCpfStore } from "@/hooks/use-cpf-store";
import { findLatestIncomeCeilingDate } from "@/lib/find-latest-income-ceiling-date";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { selectLatestIncomeCeilingDate } from "@/stores/selectors";

const SHORT_LABELS: Record<string, string> = {
  "2023-01-01": "Pre-Sept 2023",
};

const shortLabel = (date: string): string =>
  SHORT_LABELS[date] ?? formatDate(date, "MMM yyyy");

const CPFIncomeCeilingTimeline = () => {
  const selectedDate = useCpfStore(selectLatestIncomeCeilingDate);
  const setSelectedDate = useCpfStore(
    (state) => state.setLatestIncomeCeilingDate,
  );
  const [isPending, startTransition] = useTransition();

  const dateKeys = Object.keys(CPF_INCOME_CEILING);
  const currentIncomeCeilingDate = findLatestIncomeCeilingDate();
  const currentCeiling = CPF_INCOME_CEILING[currentIncomeCeilingDate];

  const handleClick = (date: string) => {
    startTransition(() => {
      setSelectedDate(date);
    });
  };

  return (
    <Card className="h-fit shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">CPF Income Ceiling Timeline</CardTitle>
        <CardDescription>
          Progressive increase following Budget 2023
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ol
          className="flex w-full items-start justify-between gap-2 px-2 py-4"
          aria-label="CPF income ceiling milestones"
        >
          {dateKeys.map((date) => {
            const isActive = date === selectedDate;
            const isCurrent = date === currentIncomeCeilingDate;

            return (
              <li
                key={date}
                className="flex min-w-0 flex-1 flex-col items-center"
              >
                <button
                  type="button"
                  onClick={() => handleClick(date)}
                  disabled={isPending}
                  aria-busy={isPending}
                  aria-pressed={isActive}
                  className="group flex w-full flex-col items-center gap-2 rounded-md px-1 py-1 text-center transition-colors hover:bg-accent/5 disabled:cursor-not-allowed"
                >
                  <span
                    className={cn(
                      "block rounded-full transition-all",
                      isCurrent
                        ? "size-4 bg-accent ring-[3px] ring-background"
                        : "size-3 bg-muted-foreground/60 group-hover:bg-accent",
                      isActive && !isCurrent && "bg-accent",
                    )}
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      "font-medium text-[11px] transition-colors",
                      isCurrent
                        ? "font-bold text-accent"
                        : "text-muted-foreground",
                      isActive && !isCurrent && "text-accent",
                    )}
                  >
                    {shortLabel(date)}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[14px] transition-colors",
                      isCurrent
                        ? "font-bold text-[16px] text-foreground"
                        : "font-semibold text-foreground",
                    )}
                  >
                    {formatCurrency(CPF_INCOME_CEILING[date], 0)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="flex items-start gap-2 rounded-lg bg-muted p-3">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            className="size-4 flex-shrink-0 text-accent"
            strokeWidth={2}
            aria-hidden="true"
          />
          <p className="text-[13px] text-muted-foreground leading-[1.55]">
            Current ceiling of{" "}
            <span className="font-mono font-semibold text-foreground">
              {formatCurrency(currentCeiling, 0)}
            </span>{" "}
            is in effect from {formatDate(currentIncomeCeilingDate)}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CPFIncomeCeilingTimeline;
