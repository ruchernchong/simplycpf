import { describe, expect, it } from "vitest";
import { getRetirementSumsForYear } from "@/constants/cpf-retirement-sums";

describe("getRetirementSumsForYear", () => {
  it("should return known retirement sums for 2024-2026", () => {
    const sums2026 = getRetirementSumsForYear(2026);
    expect(sums2026.brs).toBe(110_200);
    expect(sums2026.frs).toBe(220_400);
    expect(sums2026.ers).toBe(440_800);
  });

  it("should project retirement sums for future years at ~3.5% growth", () => {
    const sums2027 = getRetirementSumsForYear(2027);
    expect(sums2027.brs).toBeGreaterThan(110_200);
    expect(sums2027.frs).toBe(sums2027.brs * 2);
    expect(sums2027.ers).toBe(sums2027.brs * 4);
  });

  it("should return earliest known sums for past years", () => {
    const sums2020 = getRetirementSumsForYear(2020);
    expect(sums2020.brs).toBe(102_900);
  });

  it("should maintain FRS = 2 × BRS and ERS = 4 × BRS relationship", () => {
    const sums2030 = getRetirementSumsForYear(2030);
    expect(sums2030.frs).toBe(sums2030.brs * 2);
    expect(sums2030.ers).toBe(sums2030.brs * 4);
  });
});
