import type { Route } from "next";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import type { ReadinessResult } from "@/lib/calculate-retirement-readiness";
import { cn } from "@/lib/utils";

interface ReadinessScoreResultProps {
  result: ReadinessResult;
  onAdjust?: () => void;
}

interface BreakdownRow {
  label: string;
  score: number;
  max: number;
}

function ScoreCircle({ score }: { score: number }) {
  return (
    <div className="flex size-32 flex-col items-center justify-center rounded-full bg-primary text-primary-foreground">
      <span className="font-bold font-mono text-3xl leading-none">{score}</span>
      <span className="text-[11px] opacity-70">/ 100</span>
    </div>
  );
}

function getBarTone(percent: number): string {
  if (percent < 0.45) return "bg-destructive";
  if (percent < 0.7) return "bg-accent/70";
  return "bg-accent";
}

function BreakdownRow({ label, score, max }: BreakdownRow) {
  const percent = max === 0 ? 0 : Math.min(1, Math.max(0, score / max));
  const isLow = percent < 0.45;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-foreground">{label}</span>
        <span
          className={cn(
            "font-mono",
            isLow ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {score} / {max}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", getBarTone(percent))}
          style={{ width: `${percent * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function ReadinessScoreResult({
  result,
  onAdjust,
}: ReadinessScoreResultProps) {
  const breakdown: BreakdownRow[] = result.breakdown.map(
    ({ label, score, max }) => ({ label, score, max }),
  );

  return (
    <div className="flex flex-col gap-4">
      <section
        aria-label="Readiness summary"
        className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:gap-6"
      >
        <ScoreCircle score={result.score} />
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <span className="self-center rounded-full bg-foreground px-2.5 py-0.5 font-semibold text-[10px] text-background uppercase tracking-[0.1em] sm:self-start">
            Summary
          </span>
          <h2 className="font-semibold text-[18px] text-foreground">
            {result.bucketLabel}
          </h2>
          <p className="max-w-md text-[13px] text-muted-foreground leading-[1.55]">
            {result.summary}
          </p>
        </div>
      </section>

      <section
        aria-label="Score breakdown"
        className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <h3 className="font-semibold text-[15px] text-foreground">
          Score Breakdown
        </h3>
        <div className="flex flex-col gap-3">
          {breakdown.map((row) => (
            <BreakdownRow key={row.label} {...row} />
          ))}
        </div>
      </section>

      <section
        aria-label="Recommended actions"
        className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <h3 className="font-semibold text-[15px] text-foreground">
          Recommended Actions
        </h3>
        <p className="text-[12px] text-muted-foreground">
          Based on your current inputs, consider these follow-up actions to
          review your retirement plan.
        </p>
        <ol className="flex flex-col gap-2">
          {result.nextSteps.map((step, index) => (
            <li
              key={step}
              className="flex items-start gap-3 rounded-md bg-muted/40 p-3"
            >
              <span className="flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-foreground font-semibold text-[10px] text-background">
                {index + 1}
              </span>
              <span className="text-[13px] text-muted-foreground leading-[1.55]">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          href={result.primaryActionHref as Route}
          className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
        >
          {result.primaryActionLabel}
        </Link>
        {onAdjust ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAdjust}
            className="gap-1.5"
          >
            Adjust inputs
          </Button>
        ) : null}
      </div>
    </div>
  );
}
