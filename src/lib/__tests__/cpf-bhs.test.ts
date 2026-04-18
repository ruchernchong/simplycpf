import { describe, expect, it } from "vitest";
import { getBhsForYear } from "@/constants/cpf-bhs";

describe("getBhsForYear", () => {
  it("should return known BHS values for 2016-2026", () => {
    expect(getBhsForYear(2016)).toBe(49_800);
    expect(getBhsForYear(2020)).toBe(60_000);
    expect(getBhsForYear(2023)).toBe(68_500);
    expect(getBhsForYear(2024)).toBe(71_500);
    expect(getBhsForYear(2025)).toBe(75_500);
    expect(getBhsForYear(2026)).toBe(79_000);
  });

  it("should project BHS for future years using S$3,500 annual increase", () => {
    expect(getBhsForYear(2027)).toBe(82_500);
    expect(getBhsForYear(2030)).toBe(93_000);
  });

  it("should return earliest known BHS for years before the map", () => {
    expect(getBhsForYear(2015)).toBe(49_800);
    expect(getBhsForYear(2010)).toBe(49_800);
  });
});
