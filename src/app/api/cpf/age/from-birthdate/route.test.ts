import { GET } from "./route";

function createRequest(query = ""): Request {
  return new Request(`http://localhost/api/cpf/age/from-birthdate${query}`);
}

describe("GET /api/cpf/age/from-birthdate", () => {
  it("requires explicit modern birth and contribution months", async () => {
    const missingBirth = await GET(createRequest("?contributionMonth=2026-08"));
    const missingContributionMonth = await GET(
      createRequest("?birthMonth=1990-01"),
    );
    const duplicateBirth = await GET(
      createRequest(
        "?birthMonth=1990-01&birthDate=01%2F1990&contributionMonth=2026-08",
      ),
    );

    expect(missingBirth.status).toBe(422);
    expect(missingContributionMonth.status).toBe(422);
    expect(duplicateBirth.status).toBe(422);
    expect((await missingBirth.json()).code).toBe("INVALID_INPUT");
  });

  it("uses month-accurate completed age and inclusive birthday boundaries", async () => {
    const birthdayResponse = await GET(
      createRequest("?birthMonth=1971-08&contributionMonth=2026-08"),
    );
    const followingMonthResponse = await GET(
      createRequest("?birthMonth=1971-08&contributionMonth=2026-09"),
    );
    const birthday = await birthdayResponse.json();
    const followingMonth = await followingMonthResponse.json();

    expect(birthdayResponse.status).toBe(200);
    expect(birthday).toMatchObject({
      birthMonth: "1971-08",
      contributionMonth: "2026-08",
      completedAge: 55,
      ageInMonths: 660,
      isBirthdayMonth: true,
      cpfRateTransition: {
        contributionBand: "55-and-below",
        allocationBand: "above-50-to-55",
        nextAgeBandStartsMonthAfterBirthday: true,
      },
    });
    expect(followingMonth).toMatchObject({
      completedAge: 55,
      ageInMonths: 661,
      isBirthdayMonth: false,
      cpfRateTransition: {
        contributionBand: "above-55-to-60",
        allocationBand: "above-55-to-60",
      },
    });
  });

  it("returns official provenance and 24-hour policy caching", async () => {
    const response = await GET(
      createRequest("?birthMonth=1990-01&contributionMonth=2026-08"),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.policy.ageTransition).toMatchObject({
      status: "official",
      verifiedAt: "2026-08-01",
    });
    expect(data.policy.ageTransition.sources[0].url).toContain("cpf.gov.sg");
    expect(data.schedule).toEqual({
      id: "cpf-2026",
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-12-31",
      status: "official",
    });
    expect(response.headers.get("cache-control")).toContain("s-maxage=86400");
  });

  it("accepts birthDate for one compatibility cycle with warnings", async () => {
    const response = await GET(
      createRequest("?birthDate=08%2F1971&contributionMonth=2026-08"),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      birthDate: "08/1971",
      birthMonth: "1971-08",
      age: 55,
      completedAge: 55,
    });
    expect(data.warnings).toContainEqual(
      expect.objectContaining({ code: "deprecated-birth-date-alias" }),
    );
  });

  it("defaults the contribution month only for the legacy alias and disables caching", async () => {
    const response = await GET(createRequest("?birthDate=01%2F1990"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.contributionMonth).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
    expect(data.warnings).toContainEqual(
      expect.objectContaining({ code: "contribution-month-defaulted" }),
    );
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("returns 422 for invalid or future birth months", async () => {
    const invalid = await GET(
      createRequest("?birthMonth=1990-13&contributionMonth=2026-08"),
    );
    const future = await GET(
      createRequest("?birthMonth=2026-09&contributionMonth=2026-08"),
    );

    expect(invalid.status).toBe(422);
    expect(future.status).toBe(422);
    expect((await invalid.json()).code).toBe("INVALID_INPUT");
  });

  it("returns 404 instead of using an unsupported policy schedule", async () => {
    const response = await GET(
      createRequest("?birthMonth=1990-01&contributionMonth=2028-01"),
    );

    expect(response.status).toBe(404);
    expect((await response.json()).code).toBe("UNSUPPORTED_POLICY_MONTH");
  });
});
