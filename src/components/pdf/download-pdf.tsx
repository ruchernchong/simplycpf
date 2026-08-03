import { pdf } from "@react-pdf/renderer";
import { CpfResultsPdf } from "@/components/pdf/cpf-results-pdf";

export interface PdfData {
  generatedAt: Date;
  ageGroup: string;
  monthlyGrossIncome: number;
  takeHomeIncome: number;
  employeeContribution: number;
  employerContribution: number;
  employeeRate: number;
  employerRate: number;
  totalContribution: number;
  remainingAW: number;
  ceilingComparison: {
    preCeiling: number;
    currentCeiling: number;
    takeHomeImpact: number;
    cpfImpact: number;
  } | null;
  distribution: Array<{ name: string; value: number }>;
}

export async function openPdf(data: PdfData): Promise<void> {
  const blob = await pdf(<CpfResultsPdf data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
