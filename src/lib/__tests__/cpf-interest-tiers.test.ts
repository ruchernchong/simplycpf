import { describe, expect, it } from "vitest";
import {
  CPF_EXTRA_INTEREST_CAP,
  CPF_EXTRA_INTEREST_RATE,
  CPF_OA_EXTRA_INTEREST_CAP,
} from "@/constants/cpf-interest-tiers";

describe("CPF Interest Tier Constants", () => {
  it("should define the extra interest cap at S$60,000", () => {
    expect(CPF_EXTRA_INTEREST_CAP).toBe(60_000);
  });

  it("should define the OA extra interest cap at S$20,000", () => {
    expect(CPF_OA_EXTRA_INTEREST_CAP).toBe(20_000);
  });

  it("should define the extra interest rate at 1%", () => {
    expect(CPF_EXTRA_INTEREST_RATE).toBe(0.01);
  });
});
