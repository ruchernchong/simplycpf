import { vi } from "vitest";
import {
  convertBirthDateToAge,
  convertBirthDateToBirthMonth,
} from "../convert-birth-date-to-age";

describe("convertBirthDateToAge", () => {
  beforeEach(() => {
    // Mock the Date constructor to return a fixed date
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 0, 1)); // January 1, 2025
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should calculate age correctly from birth date", () => {
    expect(convertBirthDateToAge("01/1990")).toBe(35);
    expect(convertBirthDateToAge("01/2000")).toBe(25);
    expect(convertBirthDateToAge("12/1980")).toBe(44);
  });

  it("should calculate age as 0 for current year", () => {
    expect(convertBirthDateToAge("01/2025")).toBe(0);
  });

  it("should calculate age correctly for birth month before current month", () => {
    // Since we mocked Date to January 1, 2025
    expect(convertBirthDateToAge("01/2024")).toBe(1); // January 2024 = 1 year ago
  });

  it("should calculate age correctly for birth month after current month", () => {
    // Edge case - birth month hasn't occurred yet this year
    expect(convertBirthDateToAge("12/2024")).toBe(0); // December 2024 = 0 years ago
  });

  it("converts the UI date to the policy birth month", () => {
    expect(convertBirthDateToBirthMonth("08/1971")).toBe("1971-08");
    expect(convertBirthDateToBirthMonth("8/1971")).toBeNull();
  });
});
