import { findAgeGroup } from "../find-age-group";

describe("findAgeGroup", () => {
  it("should find the correct age group for age within range", () => {
    // First age group (0-35)
    expect(findAgeGroup(0).description).toBe("35 and below");
    expect(findAgeGroup(20).description).toBe("35 and below");
    expect(findAgeGroup(35).description).toBe("35 and below");

    // Second age group (35-45)
    expect(findAgeGroup(40).description).toBe("Above 35 to 45");
    expect(findAgeGroup(45).description).toBe("Above 35 to 45");

    // Third age group (45-50)
    expect(findAgeGroup(48).description).toBe("Above 45 to 50");

    // Last age group (above 70)
    expect(findAgeGroup(71).description).toBe("Above 70");
    expect(findAgeGroup(100).description).toBe("Above 70");
  });

  it("should return the first age group for invalid ages", () => {
    // Negative ages should default to first age group
    expect(findAgeGroup(-1).description).toBe("35 and below");
  });

  it("should correctly handle boundary cases", () => {
    expect(findAgeGroup(35).description).toBe("35 and below");
    expect(findAgeGroup(45).description).toBe("Above 35 to 45");
    expect(findAgeGroup(50).description).toBe("Above 45 to 50");
    expect(findAgeGroup(55).description).toBe("Above 50 to 55");
    expect(findAgeGroup(60).description).toBe("Above 55 to 60");
    expect(findAgeGroup(65).description).toBe("Above 60 to 65");
    expect(findAgeGroup(70).description).toBe("Above 65 to 70");
    expect(findAgeGroup(71).description).toBe("Above 70");
  });
});
