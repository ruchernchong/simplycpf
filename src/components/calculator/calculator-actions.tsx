"use client";

import { Button } from "@heroui/react";
import { Check, Download, Link2 } from "lucide-react";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import { CPF_INCOME_CEILING } from "@/constants";
import { useCpfStore } from "@/hooks/use-cpf-store";
import { calculateCpfContribution } from "@/lib/calculate-cpf-contribution";
import { convertBirthDateToBirthMonth } from "@/lib/convert-birth-date-to-age";
import {
  selectAge,
  selectAgeGroup,
  selectBirthDate,
  selectCitizenshipStatus,
  selectFormStep,
  selectLatestIncomeCeilingDate,
  selectMonthlyGrossIncome,
} from "@/stores/selectors";
import {
  buildFigures,
  buildIllustrativeFigures,
  findPreviousCeilingDate,
} from "./figures";
import { buildCalculatorPdfData } from "./pdf-data";

export function CalculatorActions() {
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const ceilingDate = useCpfStore(selectLatestIncomeCeilingDate);
  const formStep = useCpfStore(selectFormStep);
  const income = useCpfStore(selectMonthlyGrossIncome);
  const age = useCpfStore(selectAge);
  const ageGroup = useCpfStore(selectAgeGroup);
  const birthDate = useCpfStore(selectBirthDate);
  const citizenship = useCpfStore(selectCitizenshipStatus);

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
    const birthMonth = convertBirthDateToBirthMonth(birthDate);
    const figures =
      formStep >= 2
        ? buildFigures({
            income,
            age,
            ...(birthMonth ? { birthMonth } : {}),
            ageGroup,
            citizenship,
            ceilingDate,
            isIllustrative: false,
          })
        : buildIllustrativeFigures(ceilingDate);

    const previousDate = findPreviousCeilingDate(figures.ceilingDate);
    const previousCeiling = CPF_INCOME_CEILING[previousDate];
    const previousInputBase = {
      contributionMonth: figures.contributionMonth,
      ordinaryWages: Math.min(figures.gross, previousCeiling),
      citizenship: figures.citizenship,
    };
    const previousResult = calculateCpfContribution(
      figures.birthMonth
        ? { ...previousInputBase, birthMonth: figures.birthMonth }
        : { ...previousInputBase, age: figures.age },
    );

    posthog.capture("pdf_download_click");
    setIsGeneratingPdf(true);

    try {
      const { openPdf } = await import("@/lib/download-pdf");

      await openPdf(
        buildCalculatorPdfData({
          figures,
          generatedAt: new Date(),
          ceilingComparison: {
            preCeiling: previousCeiling,
            currentCeiling: figures.ceiling,
            takeHomeImpact:
              figures.takeHome -
              (figures.gross - previousResult.contribution.employee),
            cpfImpact:
              figures.total - previousResult.contribution.totalContribution,
          },
        }),
      );
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
