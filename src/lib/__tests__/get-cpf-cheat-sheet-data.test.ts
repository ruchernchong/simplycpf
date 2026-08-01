import { getCpfCheatSheetData } from "../get-cpf-cheat-sheet-data";

describe("getCpfCheatSheetData", () => {
  it("returns the expected printable reference sections", () => {
    const data = getCpfCheatSheetData();

    expect(data.title).toBe("SimplyCPF CPF Cheat Sheet");
    expect(data.referenceYear).toBe(2026);
    expect(data.verifiedAt).toBe("2026-08-01");
    expect(data.sections).toHaveLength(9);
    expect(data.sections.map((section) => section.title)).toEqual(
      expect.arrayContaining([
        "CPF Contribution Rates by Age",
        "Wage Ceiling Timeline",
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
      (section) => section.title === "Wage Ceiling Timeline",
    );

    expect(interestSection?.rows).toContainEqual([
      "OA floor rate",
      "2.5% p.a.",
    ]);
    expect(ceilingSection?.rows).toContainEqual([
      "2026-01-01 to 2026-12-31",
      "S$8,000",
      "S$102,000",
    ]);
  });

  it("carries source and status metadata into every generated section", () => {
    const data = getCpfCheatSheetData();

    for (const section of data.sections) {
      expect(section.status).toBe("official");
      expect(section.verifiedAt).toBe("2026-08-01");
      expect(section.sourceUrls.length).toBeGreaterThan(0);
      expect(
        section.sourceUrls.every((url) => url.startsWith("https://")),
      ).toBe(true);
    }
  });

  it("shows RA after the SA closure and separates top-up capacity from relief", () => {
    const data = getCpfCheatSheetData();
    const allocation = data.sections.find(
      (section) => section.title === "OA / SA or RA / MA Allocation",
    );
    const topUps = data.sections.find(
      (section) => section.title === "Retirement Top-Ups and Tax Relief",
    );

    expect(
      allocation?.rows.find((row) => row[0] === "Above 55 to 60")?.[2],
    ).toContain("RA");
    expect(topUps?.rows).toContainEqual([
      "Actual retirement top-up capacity from 55",
      "current ERS less qualifying retirement savings",
    ]);
  });
});
