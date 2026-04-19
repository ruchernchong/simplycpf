import { File01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import posthog from "posthog-js";
import { useEffect, useRef, useState } from "react";
import { shallow } from "zustand/shallow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      const eventProps = {
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
      };
      posthog.capture("calculator_complete", eventProps);
    }
  }, [monthlyGrossIncome, ageGroup, currentCeilingDate]);

  const annualWage = monthlyGrossIncome * 12;
  const currentCeiling = CPF_INCOME_CEILING[currentCeilingDate];

  // Helper function to safely format currency with fallback
  const safeCurrency = (value: number | undefined, decimalPlaces = 2) => {
    if (!value || Number.isNaN(value)) {
      return formatCurrency(0, decimalPlaces);
    }
    return formatCurrency(value, decimalPlaces);
  };

  // Helper function to safely format percentage with fallback
  const safePercent = (value: number | undefined) => {
    if (!value || Number.isNaN(value)) return "0";
    return (value * 100).toFixed(0);
  };

  const additionalWageGap = CPF_ADDITIONAL_WAGE_CEILING - annualWage;
  const remainingAdditionalWage = Math.max(0, additionalWageGap);

  const takeHomeImpact = -ceilingComparison.takeHomePayDifference;
  const cpfImpact = -ceilingComparison.totalContributionDifference;
  const hasNoCeilingDifference = takeHomeImpact === 0 && cpfImpact === 0;

  async function handleDownloadPdf() {
    const pdfEventProps = { has_ceiling_comparison: !hasNoCeilingDifference };
    posthog.capture("pdf_download_click", pdfEventProps);
    setIsGeneratingPdf(true);
    try {
      const pdfData: PdfData = {
        generatedAt: new Date(),
        ageGroup: ageGroup?.description || "Not specified",
        monthlyGrossIncome,
        takeHomeIncome: contributionResult.afterCpfContribution,
        employeeContribution: contributionResult.contribution.employee,
        employerContribution: contributionResult.contribution.employer,
        employeeRate: Math.round((contributionRate.employee ?? 0) * 100),
        employerRate: Math.round((contributionRate.employer ?? 0) * 100),
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
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Your CPF Savings</CardTitle>
        <CardDescription>
          Where your retirement money goes this month
        </CardDescription>
        <p className="text-muted-foreground text-xs">
          Rates sourced from CPF Board publications · Open-source and verifiable
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
          <p className="mb-1 text-muted-foreground text-sm">
            Your Take-Home Income
          </p>
          <p className="font-bold font-mono text-3xl text-foreground">
            {safeCurrency(
              useAnimatedNumber(contributionResult.afterCpfContribution),
            )}
          </p>
          <p className="text-muted-foreground text-xs">
            After CPF contributions from your salary
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between border-b py-4">
            <p className="text-muted-foreground text-sm">Age Group</p>
            <p className="text-right font-medium">
              {ageGroup?.description || "Not specified"}
            </p>
          </div>
          <div className="flex items-center justify-between border-b py-4">
            <p className="text-muted-foreground text-sm">Gross Income</p>
            <p className="text-right font-medium font-mono">
              {safeCurrency(useAnimatedNumber(monthlyGrossIncome))}
            </p>
          </div>
          <div className="flex items-center justify-between border-b py-4">
            <p className="text-muted-foreground text-sm">
              Your contribution ({safePercent(contributionRate.employee)}%)
            </p>
            <p className="text-right font-medium font-mono text-accent">
              {safeCurrency(
                useAnimatedNumber(contributionResult.contribution.employee),
              )}
            </p>
          </div>
          <div className="flex items-center justify-between border-b py-4">
            <p className="text-muted-foreground text-sm">
              Your employer adds ({safePercent(contributionRate.employer)}%)
            </p>
            <p className="text-right font-medium font-mono text-accent">
              {safeCurrency(
                useAnimatedNumber(contributionResult.contribution.employer),
              )}
            </p>
          </div>
          <div className="flex items-center justify-between py-4">
            <p className="text-muted-foreground text-sm">
              Total monthly CPF contributions
            </p>
            <p className="text-right font-mono font-semibold text-accent">
              {safeCurrency(
                useAnimatedNumber(
                  contributionResult.contribution.totalContribution,
                ),
              )}
            </p>
          </div>
        </div>
        <div className="rounded-md border border-accent/30 bg-accent/5 p-4">
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm">
              Remaining room for Additional Wage (AW) contributions
            </p>
            <p className="font-medium font-mono text-lg">
              {safeCurrency(useAnimatedNumber(remainingAdditionalWage), 0)}
            </p>
            <p className="text-muted-foreground text-xs">
              AW covers bonuses and variable pay. The cap is $102,000 annually
              minus your ordinary wages.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-2">
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
      </CardFooter>
    </Card>
  );
}
