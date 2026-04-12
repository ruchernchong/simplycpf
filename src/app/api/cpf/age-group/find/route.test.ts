import { GET } from "./route";

const createRequest = (age?: number): Request => {
  const url = new URL("http://localhost/api/cpf/age-group/find");
  if (age !== undefined) {
    url.searchParams.set("age", age.toString());
  }
  return new Request(url.toString());
};

describe("GET /api/cpf/age-group/find", () => {
  it("should return 400 when age is not provided", async () => {
    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("age is required");
  });

  it("should return 400 when age is negative", async () => {
    const request = createRequest(-1);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("age must be a non-negative number");
  });

  it("should return age group with correct structure", async () => {
    const request = createRequest(30);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("description");
    expect(data).toHaveProperty("minAge");
    expect(data).toHaveProperty("contributionRate");
    expect(data).toHaveProperty("distributionRate");
  });

  it.each([
    { age: 0, expectedDescription: "35 and below" },
    { age: 25, expectedDescription: "35 and below" },
    { age: 35, expectedDescription: "Above 35 to 45" },
    { age: 40, expectedDescription: "Above 35 to 45" },
    { age: 45, expectedDescription: "Above 45 to 50" },
    { age: 48, expectedDescription: "Above 45 to 50" },
    { age: 50, expectedDescription: "Above 50 to 55" },
    { age: 55, expectedDescription: "Above 55 to 60" },
    { age: 60, expectedDescription: "Above 60 to 65" },
    { age: 65, expectedDescription: "Above 65 to 70" },
    { age: 70, expectedDescription: "Above 70" },
    { age: 75, expectedDescription: "Above 70" },
  ])("should return $expectedDescription for age $age", async ({
    age,
    expectedDescription,
  }) => {
    const request = createRequest(age);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.description).toBe(expectedDescription);
  });
});
