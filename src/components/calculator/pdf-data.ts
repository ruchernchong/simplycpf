import { CPF_ACCOUNT_MAP } from "@/constants";
import type { PdfData } from "@/lib/download-pdf";
import type { CalculatorFigures } from "./figures";

type CeilingComparison = PdfData["ceilingComparison"];

interface BuildCalculatorPdfDataParams {
  figures: CalculatorFigures;
  generatedAt: Date;
  ceilingComparison: CeilingComparison;
}

/**
 * Adapts calculator results for the PDF without inventing missing annual-AW or
 * post-55 account context.
 */
export function buildCalculatorPdfData({
  figures,
  generatedAt,
  ceilingComparison,
}: BuildCalculatorPdfDataParams): PdfData {
  const accountKey = figures.isRetirementAccount ? "RA" : "SA";
  const distribution = figures.selectedDistribution
    ? [
        { key: "OA", value: figures.selectedDistribution.oa },
        {
          key: accountKey,
          value: figures.selectedDistribution.retirement,
        },
        { key: "MA", value: figures.selectedDistribution.ma },
      ].map(({ key, value }) => ({
        name: `${CPF_ACCOUNT_MAP[key]} (${key})`,
        value,
      }))
    : null;

  return {
    generatedAt,
    ageGroup: figures.ageGroup.description,
    monthlyGrossIncome: figures.gross,
    takeHomeIncome: figures.takeHome,
    employeeContribution: figures.employee,
    employerContribution: figures.employer,
    employeeRate: figures.employeeRate,
    employerRate: figures.employerRate,
    totalContribution: figures.total,
    wageBandLabel: figures.wageBandLabel,
    // The calculator accepts monthly OW only. Annual OW and prior-AW context
    // are therefore unavailable and must not be inferred from one month.
    remainingAdditionalWageCeiling: null,
    ceilingComparison,
    distribution,
    ...(figures.routing ? { routing: figures.routing } : {}),
    warnings: figures.warnings.map((warning) => warning.message),
  };
}
