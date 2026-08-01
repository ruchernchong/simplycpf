import { pdf } from "@react-pdf/renderer";
import { CpfResultsPdf } from "@/components/pdf/cpf-results-pdf";
import type { ContributionRouting } from "@/policy";

export interface PdfData {
  generatedAt: Date;
  ageGroup: string;
  monthlyGrossIncome: number;
  takeHomeIncome: number;
  employeeContribution: number;
  employerContribution: number;
  /** Effective decimal rate after CPF's statutory rounding (for example, 0.125). */
  employeeRate: number;
  /** Effective decimal rate after CPF's statutory rounding (for example, 0.075). */
  employerRate: number;
  totalContribution: number;
  wageBandLabel: string;
  /** Null unless annual OW and prior-AW context were actually supplied. */
  remainingAdditionalWageCeiling: number | null;
  ceilingComparison: {
    preCeiling: number;
    currentCeiling: number;
    takeHomeImpact: number;
    cpfImpact: number;
  } | null;
  /** Null when account context leaves the post-55 routing branch undetermined. */
  distribution: Array<{ name: string; value: number }> | null;
  routing?: ContributionRouting;
  warnings: readonly string[];
}

export async function openPdf(data: PdfData): Promise<void> {
  const blob = await pdf(<CpfResultsPdf data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
