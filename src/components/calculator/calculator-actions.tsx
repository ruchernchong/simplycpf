"use client";

import { Button } from "@heroui/react";
import { Check, Download, Link2 } from "lucide-react";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import {
  CPF_ACCOUNT_MAP,
  CPF_ADDITIONAL_WAGE_CEILING,
  CPF_INCOME_CEILING,
} from "@/constants";
import { useCpfStore } from "@/hooks/use-cpf-store";
import { calculateCpfContribution } from "@/lib/calculate-cpf-contribution";
import {
  selectAge,
  selectAgeGroup,
  selectFormStep,
  selectLatestIncomeCeilingDate,
  selectMonthlyGrossIncome,
} from "@/stores/selectors";
import {
  buildFigures,
  buildIllustrativeFigures,
  findPreviousCeilingDate,
} from "./figures";

export function CalculatorActions() {
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const ceilingDate = useCpfStore(selectLatestIncomeCeilingDate);
  const formStep = useCpfStore(selectFormStep);
  const income = useCpfStore(selectMonthlyGrossIncome);
  const age = useCpfStore(selectAge);
  const ageGroup = useCpfStore(selectAgeGroup);

  useEffect(() => {
    if (!isCopied) return;
    const timer = setTimeout(() => setIsCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [isCopied]);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      posthog.capture("calculator_link_copied");
      setIsCopied(true);
    } catch (error) {
      posthog.captureException(error);
    }
  }

  async function handleDownloadPdf() {
    const figures =
      formStep >= 2
        ? buildFigures({
            income,
            age,
            ageGroup,
            ceilingDate,
            isIllustrative: false,
          })
        : buildIllustrativeFigures(ceilingDate);

    const previousDate = findPreviousCeilingDate(figures.ceilingDate);
    const previousResult = calculateCpfContribution(
      figures.gross,
      previousDate,
      { ageGroup: figures.ageGroup },
    );

    posthog.capture("pdf_download_click");
    setIsGeneratingPdf(true);

    try {
      const { openPdf } = await import("@/lib/download-pdf");

      await openPdf({
        generatedAt: new Date(),
        ageGroup: figures.ageGroup.description,
        monthlyGrossIncome: figures.gross,
        takeHomeIncome: figures.takeHome,
        employeeContribution: figures.employee,
        employerContribution: figures.employer,
        employeeRate: Math.round(figures.employeeRate * 100),
        employerRate: Math.round(figures.employerRate * 100),
        totalContribution: figures.total,
        remainingAW: Math.max(
          0,
          CPF_ADDITIONAL_WAGE_CEILING - figures.gross * 12,
        ),
        ceilingComparison: {
          preCeiling: CPF_INCOME_CEILING[previousDate],
          currentCeiling: figures.ceiling,
          takeHomeImpact:
            figures.takeHome - previousResult.afterCpfContribution,
          cpfImpact:
            figures.total - previousResult.contribution.totalContribution,
        },
        distribution: [
          { key: "OA", value: figures.oa },
          { key: "SA", value: figures.sa },
          { key: "MA", value: figures.ma },
        ].map(({ key, value }) => ({
          name: `${CPF_ACCOUNT_MAP[key]} (${key})`,
          value,
        })),
      });
    } catch (error) {
      posthog.captureException(error);
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        isDisabled={isGeneratingPdf}
        onPress={handleDownloadPdf}
        size="sm"
        variant="outline"
      >
        <Download aria-hidden className="size-4" />
        {isGeneratingPdf ? "Preparing PDF" : "Download PDF"}
      </Button>
      <Button onPress={handleCopyLink} size="sm" variant="primary">
        {isCopied ? (
          <Check aria-hidden className="size-4" />
        ) : (
          <Link2 aria-hidden className="size-4" />
        )}
        {isCopied ? "Copied" : "Copy shareable link"}
      </Button>
    </div>
  );
}
