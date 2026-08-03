import { formatDateInput, isValidDateFormat } from "../date-utils";

describe("formatDateInput", () => {
  it("should format input with correct MM/YYYY format", () => {
    expect(formatDateInput("012023")).toBe("01/2023");
    expect(formatDateInput("122023")).toBe("12/2023");
  });

  it("should handle partial inputs", () => {
    expect(formatDateInput("1")).toBe("1");
    expect(formatDateInput("12")).toBe("12");
    expect(formatDateInput("123")).toBe("12/3");
    expect(formatDateInput("1234")).toBe("12/34");
  });

  it("should clean non-digit characters", () => {
    expect(formatDateInput("01/2023")).toBe("01/2023");
    expect(formatDateInput("01-2023")).toBe("01/2023");
    expect(formatDateInput("01A2023")).toBe("01/2023");
  });

  it("should limit input to 6 digits (MMYYYY format)", () => {
    expect(formatDateInput("0120231")).toBe("01/2023");
    expect(formatDateInput("01202312")).toBe("01/2023");
  });
});

describe("isValidDateFormat", () => {
  it("should validate correct date formats", () => {
    expect(isValidDateFormat("01/2023")).toBe(true);
    expect(isValidDateFormat("12/2000")).toBe(true);
  });

  it("should reject invalid month values", () => {
    expect(isValidDateFormat("00/2023")).toBe(false);
    expect(isValidDateFormat("13/2023")).toBe(false);
  });

  it("should reject invalid year values", () => {
    expect(isValidDateFormat("01/1899")).toBe(false);

    // This test may fail in the future as it's based on current year
    const futureYear = new Date().getFullYear() + 1;
    expect(isValidDateFormat(`01/${futureYear}`)).toBe(false);
  });

  it("should reject incorrect format patterns", () => {
    expect(isValidDateFormat("1/2023")).toBe(false); // Missing leading zero
    expect(isValidDateFormat("01-2023")).toBe(false); // Wrong separator
    expect(isValidDateFormat("01/23")).toBe(false); // Short year
    expect(isValidDateFormat("012023")).toBe(false); // No separator
  });
});
