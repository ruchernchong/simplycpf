import { formatDateInput } from "../format-date-input";

describe("formatDateInput", () => {
  it("should format inputs with 6 digits correctly (MMYYYY)", () => {
    expect(formatDateInput("012024", "012024")).toBe("01/2024");
    expect(formatDateInput("122023", "122023")).toBe("12/2023");
  });

  it("should handle inputs with less than 6 digits", () => {
    expect(formatDateInput("01", "")).toBe("01");
    expect(formatDateInput("01", "01")).toBe("01");
    expect(formatDateInput("0", "0")).toBe("0");
  });

  it("should add slash when needed", () => {
    expect(formatDateInput("01", "012")).toBe("0/1");
    expect(formatDateInput("123456", "")).toBe("12/3456");
  });

  it("should remove non-numeric characters", () => {
    expect(formatDateInput("01/2024", "01/2024")).toBe("01/2024");
    expect(formatDateInput("01-2024", "")).toBe("01/2024");
    expect(formatDateInput("01a2024", "")).toBe("01/2024");
  });
});
