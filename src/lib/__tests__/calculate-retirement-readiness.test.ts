import { calculateRetirementReadiness } from "../calculate-retirement-readiness";

describe("calculateRetirementReadiness", () => {
  it("returns a low score when planning habits are weak", () => {
    const result = calculateRetirementReadiness({
      citizenshipStatus: "citizen",
      housingUsage: "heavy",
      planningHabit: "never",
      topUpHabit: "never",
      cpfLifeConfidence: "low",
    });

    expect(result.score).toBe(27);
    expect(result.bucket).toBe("low");
    expect(result.interestArea).toBe("cpf-life");
  });

  it("returns a mid score for someone building foundations", () => {
    const result = calculateRetirementReadiness({
      citizenshipStatus: "citizen",
      housingUsage: "some",
      planningHabit: "once",
      topUpHabit: "considering",
      cpfLifeConfidence: "medium",
    });

    expect(result.score).toBe(62);
    expect(result.bucket).toBe("mid");
    expect(result.primaryActionHref).toBe("/projection");
  });

  it("routes PR users to calculator-oriented next steps", () => {
    const result = calculateRetirementReadiness({
      citizenshipStatus: "spr-new",
      housingUsage: "none",
      planningHabit: "ongoing",
      topUpHabit: "consistent",
      cpfLifeConfidence: "high",
    });

    expect(result.score).toBe(97);
    expect(result.bucket).toBe("high");
    expect(result.interestArea).toBe("pr-rates");
    expect(result.primaryActionHref).toBe("/calculator");
  });

  it("sends high-score citizen projection users to the what-if page", () => {
    const result = calculateRetirementReadiness({
      citizenshipStatus: "citizen",
      housingUsage: "none",
      planningHabit: "ongoing",
      topUpHabit: "sometimes",
      cpfLifeConfidence: "high",
    });

    expect(result.bucket).toBe("high");
    expect(result.interestArea).toBe("projection");
    expect(result.bucketLabel).toBe("On Track");
    expect(result.primaryActionHref).toBe("/what-if");
  });
});
