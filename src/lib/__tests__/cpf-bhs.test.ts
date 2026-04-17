import { describe, expect, it } from "vitest";
import { getBhsForYear } from "@/constants/cpf-bhs";

describe("getBhsForYear", () => {
  it("should return known BHS values for 2024-2026", () => {
    expect(getBhsForYear(2024)).toBe(71_500);
    expect(getBhsForYear(2025)).toBe(73_500);
    expect(getBhsForYear(2026)).toBe(75_500);
  });

  it("should project BHS for future years using S$2,000 annual increase", () => {
    expect(getBhsForYear(2027)).toBe(77_500);
    expect(getBhsForYear(2030)).toBe(83_500);
  });

  it("should return earliest known BHS for past years", () => {
    expect(getBhsForYear(2020)).toBe(71_500);
    expect(getBhsForYear(2023)).toBe(71_500);
  });
});
