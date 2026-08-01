import { describe, expect, it } from "vitest";
import { getBhsForProjection, getBhsForYear } from "@/constants/cpf-bhs";

describe("CPF Basic Healthcare Sum policy", () => {
  it("returns the published 2016 to 2026 values", () => {
    expect(getBhsForYear(2016)).toBe(49_800);
    expect(getBhsForYear(2020)).toBe(60_000);
    expect(getBhsForYear(2023)).toBe(68_500);
    expect(getBhsForYear(2024)).toBe(71_500);
    expect(getBhsForYear(2025)).toBe(75_500);
    expect(getBhsForYear(2026)).toBe(79_000);
  });

  it("does not fabricate unsupported public reference years", () => {
    expect(() => getBhsForYear(2015)).toThrow(RangeError);
    expect(() => getBhsForYear(2027)).toThrow(RangeError);
  });

  it("freezes the BHS for a member from the year they turn 65", () => {
    const in2025 = getBhsForProjection(2025, 1960);
    const in2035 = getBhsForProjection(2035, 1960);

    expect(in2025.value).toBe(75_500);
    expect(in2035.value).toBe(75_500);
    expect(in2035.metadata.status).toBe("official");
  });

  it("holds the last published BHS constant for future cohorts and marks it assumed", () => {
    const future = getBhsForProjection(2030, 2000);

    expect(future.value).toBe(79_000);
    expect(future.metadata.status).toBe("assumed");
    expect(future.metadata.version).toBe("2030-freeze-2026");
  });

  it("uses CPF Board's published S$49,800 cohort value for 1951 or earlier", () => {
    const olderCohort = getBhsForProjection(2026, 1945);

    expect(olderCohort.value).toBe(49_800);
    expect(olderCohort.metadata.status).toBe("official");
  });
});
