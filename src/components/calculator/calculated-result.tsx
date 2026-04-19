import { File01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import posthog from "posthog-js";
import { useEffect, useRef, useState } from "react";
import { shallow } from "zustand/shallow";
import { Button } from "@/components/ui/button";
import {
  CPF_ACCOUNT_MAP,
  CPF_ADDITIONAL_WAGE_CEILING,
  CPF_INCOME_CEILING,
  CPF_INCOME_CEILING_BEFORE_SEPT_2023,
} from "@/constants";
import useAnimatedNumber from "@/hooks/use-animated-number";
import { useCpfStore } from "@/hooks/use-cpf-store";
import { openPdf, type PdfData } from "@/lib/download-pdf";
import { formatCurrency } from "@/lib/format";
import {
  selectAgeGroup,
  selectCeilingComparison,
  selectContributionResult,
  selectDistributionResults,
  selectLatestIncomeCeilingDate,
  selectMonthlyGrossIncome,
} from "@/stores/selectors";

const ACCOUNT_TONES: Record<string, { dot: string; bar: string }> = {
  OA: { dot: "bg-chart-1", bar: "bg-chart-1" },
  SA: { dot: "bg-chart-2", bar: "bg-chart-2" },
  MA: { dot: "bg-chart-3", bar: "bg-chart-3" },
};

export function CalculatedResult() {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const hasTrackedCompletion = useRef(false);

  const monthlyGrossIncome = useCpfStore(selectMonthlyGrossIncome);
  const ageGroup = useCpfStore(selectAgeGroup, shallow);
  const contributionRate = ageGroup.contributionRate;
  const contributionResult = useCpfStore(selectContributionResult, shallow);
  const distributionResults = useCpfStore(selectDistributionResults, shallow);
  const ceilingComparison = useCpfStore(selectCeilingComparison, shallow);
  const currentCeilingDate = useCpfStore(selectLatestIncomeCeilingDate);

  useEffect(() => {
    if (monthlyGrossIncome > 0 && !hasTrackedCompletion.current) {
      hasTrackedCompletion.current = true;
      posthog.capture("calculator_complete", {
        age_bracket:
          ageGroup?.description?.replaceAll(/\s+/g, "_").toLowerCase() ??
          "unknown",
        ceiling_year: currentCeilingDate,
        income_bracket:
          monthlyGrossIncome <= 6000
            ? "at_or_below_6000"
            : monthlyGrossIncome <= 6800
              ? "6000_to_6800"
              : "above_6800",
      });
    }
  }, [monthlyGrossIncome, ageGroup, currentCeilingDate]);

  const annualWage = monthlyGrossIncome * 12;
  const currentCeiling = CPF_INCOME_CEILING[currentCeilingDate];
  const remainingAdditionalWage = Math.max(
    0,
    CPF_ADDITIONAL_WAGE_CEILING - annualWage,
  );

  const animatedTotal = useAnimatedNumber(
    contributionResult.contribution.totalContribution,
  );
  const animatedEmployee = useAnimatedNumber(
    contributionResult.contribution.employee,
  );
  const animatedEmployer = useAnimatedNumber(
    contributionResult.contribution.employer,
  );
  const animatedTakeHome = useAnimatedNumber(
    contributionResult.afterCpfContribution,
  );

  const totalDistribution = distributionResults.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  const employeePct = Math.round((contributionRate.employee ?? 0) * 100);
  const employerPct = Math.round((contributionRate.employer ?? 0) * 100);

  const takeHomeImpact = -ceilingComparison.takeHomePayDifference;
  const cpfImpact = -ceilingComparison.totalContributionDifference;
  const hasNoCeilingDifference = takeHomeImpact === 0 && cpfImpact === 0;

  async function handleDownloadPdf() {
    posthog.capture("pdf_download_click", {
      has_ceiling_comparison: !hasNoCeilingDifference,
    });
    setIsGeneratingPdf(true);
    try {
      const pdfData: PdfData = {
        generatedAt: new Date(),
        ageGroup: ageGroup?.description || "Not specified",
        monthlyGrossIncome,
        takeHomeIncome: contributionResult.afterCpfContribution,
        employeeContribution: contributionResult.contribution.employee,
        employerContribution: contributionResult.contribution.employer,
        employeeRate: employeePct,
        employerRate: employerPct,
        totalContribution: contributionResult.contribution.totalContribution,
        remainingAW: remainingAdditionalWage,
        ceilingComparison: hasNoCeilingDifference
          ? null
          : {
              preCeiling: CPF_INCOME_CEILING_BEFORE_SEPT_2023,
              currentCeiling,
              takeHomeImpact,
              cpfImpact,
            },
        distribution: distributionResults.map(({ name, value }) => ({
          name: `${CPF_ACCOUNT_MAP[name]} (${name})`,
          value,
        })),
      };

      await openPdf(pdfData);
    } catch (err) {
      posthog.captureException(err);
      throw err;
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  return (
    <div
      id="calculator-results"
      className="calculator-results flex scroll-mt-24 flex-col gap-4"
    >
      {/* Estimated Total — dark slate */}
      <section
        aria-label="Estimated total monthly CPF"
        className="flex flex-col gap-2 rounded-lg bg-primary p-6 text-primary-foreground"
      >
        <p className="font-semibold text-[11px] uppercase tracking-[0.1em] opacity-70">
          Estimated total monthly CPF
        </p>
        <div className="flex flex-wrap items-baseline gap-4">
          <p className="font-bold font-mono text-4xl">
            {formatCurrency(animatedTotal)}
          </p>
          <p className="text-[13px] opacity-70">Employee + employer combined</p>
        </div>
      </section>

      {/* Employee + Employer share — 2-up grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        <section
          aria-label="Your employee share"
          className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4"
        >
          <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.1em]">
            Your employee share
          </p>
          <p className="font-bold font-mono text-2xl text-foreground">
            {formatCurrency(animatedEmployee)}
          </p>
          <p className="text-[12px] text-muted-foreground">
            {employeePct}% of wages
          </p>
        </section>
        <section
          aria-label="Employer share"
          className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4"
        >
          <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.1em]">
            Employer share
          </p>
          <p className="font-bold font-mono text-2xl text-foreground">
            {formatCurrency(animatedEmployer)}
          </p>
          <p className="text-[12px] text-muted-foreground">
            {employerPct}% of wages
          </p>
        </section>
      </div>

      {/* Distribution — horizontal stacked bar + legend */}
      {totalDistribution > 0 && (
        <section
          aria-label="CPF allocation across OA, SA, and MA"
          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6"
        >
          <h3 className="font-semibold text-[14px] text-foreground">
            How your CPF is allocated (OA / SA / MA)
          </h3>
          <div className="flex h-3 w-full overflow-hidden rounded-md">
            {distributionResults.map(({ name, value }) => {
              const tone = ACCOUNT_TONES[name];
              const flex = Math.max(0, value);
              return (
                <span
                  key={name}
                  className={tone?.bar ?? "bg-accent"}
                  style={{ flex: `${flex} 1 0` }}
                  aria-hidden="true"
                />
              );
            })}
          </div>
          <ul className="grid gap-4 sm:grid-cols-3">
            {distributionResults.map(({ name, value }) => {
              const tone = ACCOUNT_TONES[name];
              const pct = totalDistribution
                ? (value / totalDistribution) * 100
                : 0;
              return (
                <li key={name} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2.5 rounded-full ${tone?.dot ?? "bg-accent"}`}
                      aria-hidden="true"
                    />
                    <span className="font-medium text-[12px] text-foreground">
                      {CPF_ACCOUNT_MAP[name] ?? name}
                    </span>
                  </div>
                  <p className="font-bold font-mono text-[18px] text-foreground">
                    {formatCurrency(value)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {pct.toFixed(1)}% of total
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Take-home + AW — supporting stats */}
      <div className="grid gap-3 sm:grid-cols-2">
        <section
          aria-label="Your take-home pay"
          className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 p-4"
        >
          <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.1em]">
            Take-home pay
          </p>
          <p className="font-bold font-mono text-[20px] text-foreground">
            {formatCurrency(animatedTakeHome)}
          </p>
          <p className="text-[12px] text-muted-foreground">
            After CPF contributions from your salary
          </p>
        </section>
        <section
          aria-label="Remaining Additional Wage room"
          className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 p-4"
        >
          <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.1em]">
            Additional Wage room
          </p>
          <p className="font-bold font-mono text-[20px] text-foreground">
            {formatCurrency(remainingAdditionalWage, 0)}
          </p>
          <p className="text-[12px] text-muted-foreground">
            Annual cap of $102,000 minus your ordinary wages
          </p>
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
        >
          <HugeiconsIcon icon={File01Icon} className="size-4" strokeWidth={2} />
          {isGeneratingPdf ? "Generating..." : "Download PDF"}
        </Button>
        <span className="text-[12px] text-muted-foreground">
          Age group: {ageGroup?.description ?? "Not specified"}
        </span>
      </div>
    </div>
  );
}
