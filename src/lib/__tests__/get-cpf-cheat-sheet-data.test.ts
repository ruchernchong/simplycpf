import { getCpfCheatSheetData } from "../get-cpf-cheat-sheet-data";

describe("getCpfCheatSheetData", () => {
  it("returns the expected printable reference sections", () => {
    const data = getCpfCheatSheetData();

    expect(data.title).toBe("SimplyCPF CPF Cheat Sheet");
    expect(data.sections).toHaveLength(9);
    expect(data.sections.map((section) => section.title)).toEqual(
      expect.arrayContaining([
        "CPF Contribution Rates by Age",
        "Income Ceiling Timeline",
        "Retirement Sums",
      ]),
    );
  });

  it("formats key rows in Singapore dollar and percentage terms", () => {
    const data = getCpfCheatSheetData();

    const interestSection = data.sections.find(
      (section) => section.title === "CPF Interest Reference",
    );
    const ceilingSection = data.sections.find(
      (section) => section.title === "Income Ceiling Timeline",
    );

    expect(interestSection?.rows).toContainEqual([
      "OA floor rate",
      "2.5% p.a.",
    ]);
    expect(ceilingSection?.rows).toContainEqual(["2026-01-01", "S$8,000"]);
  });
});
