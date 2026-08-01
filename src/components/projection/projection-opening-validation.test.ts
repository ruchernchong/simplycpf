import { describe, expect, it } from "vitest";
import { isProjectionOpeningAccountStateValid } from "./projection-opening-validation";

const zeroBalances = { oa: 0, sa: 0, ma: 0, ra: 0 };

describe("isProjectionOpeningAccountStateValid", () => {
  it("allows an under-55 member to open with SA savings after 2025", () => {
    expect(
      isProjectionOpeningAccountStateValid({
        currentAge: 30,
        raExistsAtOpening: false,
        startMonth: "2026-08",
        specialAccountClosureMonth: "2025-01",
        initialBalances: { ...zeroBalances, sa: 20_000 },
        initialYearToDateAccruedInterest: zeroBalances,
      }),
    ).toBe(true);
  });

  it("rejects SA savings after the account has closed for a member over 55", () => {
    expect(
      isProjectionOpeningAccountStateValid({
        currentAge: 60,
        raExistsAtOpening: true,
        startMonth: "2026-08",
        specialAccountClosureMonth: "2025-01",
        initialBalances: { ...zeroBalances, sa: 1, ra: 100_000 },
        initialYearToDateAccruedInterest: zeroBalances,
      }),
    ).toBe(false);
  });
});
