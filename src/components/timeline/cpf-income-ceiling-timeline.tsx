"use client";

import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
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

const CPFIncomeCeilingTimeline = () => {
  const selectedDate = useCpfStore(selectLatestIncomeCeilingDate);
  const setSelectedDate = useCpfStore(
    (state) => state.setLatestIncomeCeilingDate,
  );
  const [isPending, startTransition] = useTransition();

  const dateKeys = Object.keys(CPF_INCOME_CEILING);
  const currentIncomeCeilingDate = findLatestIncomeCeilingDate();

  const handleTimelineItemClick = (date: string) => {
    startTransition(() => {
      setSelectedDate(date);
    });
  };

  return (
    <Card className="h-fit shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">CPF Income Ceiling Timeline</CardTitle>
        <CardDescription>
          Track the progression of CPF income ceiling changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {dateKeys.map((date, index) => {
            const isActive = date === selectedDate;
            const isCurrent = date === currentIncomeCeilingDate;
            const isLast = index === dateKeys.length - 1;
            const isPast = index < dateKeys.indexOf(selectedDate);

            return (
              <div key={date} className="flex gap-4">
                {/* Timeline track */}
                <div className="flex flex-col items-center">
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    className={cn(
                      "size-6 flex-shrink-0 transition-colors",
                      isCurrent ? "text-accent" : "text-muted-foreground",
                    )}
                    strokeWidth={2}
                  />
                  {!isLast && (
                    <div
                      className={cn(
                        "w-0.5 grow",
                        isPast || isActive ? "bg-accent" : "bg-border",
                      )}
                    />
                  )}
                </div>

                {/* Content */}
                <button
                  type="button"
                  className={cn(
                    "mb-6 flex cursor-pointer flex-col gap-2 text-left transition-all hover:scale-105",
                    isActive &&
                      "scale-105 rounded-lg border-2 border-accent bg-accent/5 p-4",
                  )}
                  onClick={() => handleTimelineItemClick(date)}
                  disabled={isPending}
                  aria-busy={isPending}
                >
                  <time
                    className={cn(
                      "font-mono text-sm transition-colors",
                      isActive
                        ? "font-semibold text-accent"
                        : "text-muted-foreground",
                      isCurrent && "font-bold text-accent",
                    )}
                  >
                    {formatDate(date)}
                  </time>
                  <div
                    className={cn(
                      "font-bold text-foreground text-lg transition-colors",
                      isActive && "text-xl",
                    )}
                  >
                    {formatCurrency(CPF_INCOME_CEILING[date])}
                  </div>
                  {index === 0 && (
                    <p className="text-muted-foreground text-xs">
                      Pre-Budget 2023
                    </p>
                  )}
                  {isCurrent && (
                    <p className="flex items-center gap-2 font-semibold text-accent text-xs uppercase tracking-wide">
                      <span className="inline-block size-2 animate-pulse rounded-full bg-accent" />
                      Current ceiling
                    </p>
                  )}
                  {isLast && (
                    <p className="text-muted-foreground text-xs">
                      Final ceiling
                    </p>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CPFIncomeCeilingTimeline;
