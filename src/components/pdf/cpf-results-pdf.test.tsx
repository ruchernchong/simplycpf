import { pdf } from "@react-pdf/renderer";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { buildCalculatorPdfData } from "@/components/calculator/pdf-data";
import { findAgeGroup } from "@/lib/find-age-group";
import { buildFigures } from "../calculator/figures";
import { CpfResultsPdf } from "./cpf-results-pdf";

function readBlobAsText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("PDF header did not decode as text."));
    });
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsText(blob);
  });
}

describe("CPF results PDF", () => {
  it("renders both official post-55 routing branches as a valid PDF", async () => {
    const figures = buildFigures({
      income: 8000,
      age: 56,
      ageGroup: findAgeGroup(56),
      citizenship: "citizen",
      ceilingDate: "2026-01-01",
      isIllustrative: false,
    });
    const data = buildCalculatorPdfData({
      figures,
      generatedAt: new Date("2026-08-01T00:00:00+08:00"),
      ceilingComparison: null,
    });

    expect(data.routing?.selected).toBe("undetermined");

    const blob = await act(() => pdf(<CpfResultsPdf data={data} />).toBlob());
    const header = await readBlobAsText(blob.slice(0, 5));

    expect(header).toBe("%PDF-");
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBeGreaterThan(1_000);
  });
});
