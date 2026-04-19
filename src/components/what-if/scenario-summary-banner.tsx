import { File01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ScenarioSummaryBannerProps {
  age65Delta: number;
  cpfLifeDelta: number;
  onDownloadPdf?: () => void;
  isGeneratingPdf?: boolean;
}

function formatDelta(value: number): string {
  const sign = value >= 0 ? "+" : "−";
  return `${sign}${formatCurrency(Math.abs(value), 0)}`;
}

export default function ScenarioSummaryBanner({
  age65Delta,
  cpfLifeDelta,
  onDownloadPdf,
  isGeneratingPdf,
}: ScenarioSummaryBannerProps) {
  return (
    <section
      aria-label="What-if scenario summary"
      className="flex flex-col gap-4 rounded-lg bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-[11px] uppercase tracking-[0.1em] opacity-70">
          Difference at age 65
        </p>
        <p
          className={cn(
            "font-bold font-mono text-3xl",
            age65Delta >= 0 ? "text-accent" : "text-destructive",
          )}
        >
          {formatDelta(age65Delta)}
        </p>
        <p className="text-[12px] opacity-80">
          Your what-if plan changes Standard CPF LIFE by{" "}
          <span className="font-semibold">
            {formatDelta(cpfLifeDelta)}/month
          </span>
          . Outcomes depend on age, income, and contribution history.
        </p>
      </div>
      {onDownloadPdf ? (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          onClick={onDownloadPdf}
          disabled={isGeneratingPdf}
        >
          <HugeiconsIcon icon={File01Icon} className="size-4" strokeWidth={2} />
          {isGeneratingPdf ? "Generating..." : "Comparison summary (PDF)"}
        </Button>
      ) : null}
    </section>
  );
}
