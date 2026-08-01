import { describe, expect, it } from "vitest";
import {
  getCohortRetirementThresholds,
  getRetirementSumsForProjection,
  getRetirementSumsForYear,
} from "@/constants/cpf-retirement-sums";

describe("CPF retirement-sum policy", () => {
  it("returns the published 2023 to 2027 values", () => {
    expect(getRetirementSumsForYear(2023)).toEqual({
      brs: 99_400,
      frs: 198_800,
      ers: 298_200,
    });
    expect(getRetirementSumsForYear(2026)).toEqual({
      brs: 110_200,
      frs: 220_400,
      ers: 440_800,
    });
    expect(getRetirementSumsForYear(2027)).toEqual({
      brs: 114_100,
      frs: 228_200,
      ers: 456_400,
    });
  });

  it("does not clamp or extrapolate unsupported public years", () => {
    expect(() => getRetirementSumsForYear(2022)).toThrow(RangeError);
    expect(() => getRetirementSumsForYear(2028)).toThrow(RangeError);
  });

  it("holds the last published sums constant only for projection use", () => {
    const future = getRetirementSumsForProjection(2035);

    expect(future.value).toEqual(getRetirementSumsForYear(2027));
    expect(future.metadata.status).toBe("assumed");
    expect(future.metadata.version).toBe("2035-freeze-2027");
  });

  it("keeps the historical 2024 ERS at three times BRS", () => {
    const sums = getRetirementSumsForYear(2024);

    expect(sums.frs).toBe(sums.brs * 2);
    expect(sums.ers).toBe(sums.brs * 3);
  });

  it("uses the fixed cohort FRS for members who turned 55 before 2023", () => {
    expect(getCohortRetirementThresholds(2011)).toMatchObject({
      brs: 65_500,
      frs: 131_000,
    });
  });

  it("freezes an unpublished future cohort threshold at 2027", () => {
    const future = getCohortRetirementThresholds(2040);

    expect(future.frs).toBe(228_200);
    expect(future.metadata.status).toBe("assumed");
  });
});
