import { GET } from "./route";

describe("GET /api/cpf/age-groups", () => {
  it("should return all 8 age groups", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(8);
  });

  it("should return age groups with correct structure", async () => {
    const response = await GET();
    const data = await response.json();

    for (const group of data) {
      expect(group).toHaveProperty("description");
      expect(group).toHaveProperty("minAge");
      expect(group).toHaveProperty("contributionRate");
      expect(group).toHaveProperty("distributionRate");
      expect(group.contributionRate).toHaveProperty("employee");
      expect(group.contributionRate).toHaveProperty("employer");
      expect(group.distributionRate).toHaveProperty("OA");
      expect(group.distributionRate).toHaveProperty("SA");
      expect(group.distributionRate).toHaveProperty("MA");
    }
  });

  it.each([
    { index: 0, description: "35 and below", minAge: 0, maxAge: 35 },
    { index: 1, description: "Above 35 to 45", minAge: 35, maxAge: 45 },
    { index: 7, description: "Above 70", minAge: 70, maxAge: undefined },
  ])("should include age group: $description", async ({
    index,
    description,
    minAge,
    maxAge,
  }) => {
    const response = await GET();
    const data = await response.json();

    expect(data[index].description).toBe(description);
    expect(data[index].minAge).toBe(minAge);
    expect(data[index].maxAge).toBe(maxAge);
  });
});
