import { pdf } from "@react-pdf/renderer";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { CpfCheatSheetPdf } from "./cpf-cheat-sheet-pdf";

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

describe("CPF cheat-sheet PDF", () => {
  it("renders the catalogue-generated reference data as a valid PDF", async () => {
    const blob = await act(() => pdf(<CpfCheatSheetPdf />).toBlob());
    const header = await readBlobAsText(blob.slice(0, 5));

    expect(header).toBe("%PDF-");
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBeGreaterThan(10_000);
  });
});
