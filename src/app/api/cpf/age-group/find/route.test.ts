import { GET } from "./route";

function createRequest(query = ""): Request {
  return new Request(`http://localhost/api/cpf/age-group/find${query}`);
}

describe("GET /api/cpf/age-group/find", () => {
  it.each([
    [35, "35 and below"],
    [45, "Above 35 to 45"],
    [50, "Above 45 to 50"],
    [55, "Above 50 to 55"],
    [60, "Above 55 to 60"],
    [65, "Above 60 to 65"],
    [70, "Above 65 to 70"],
    [71, "Above 70"],
  ])("keeps exact age %i in the inclusive upper band", async (age, expectedDescription) => {
    const response = await GET(
      createRequest(`?contributionMonth=2026-08&age=${age}`),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.description).toBe(expectedDescription);
  });

  it("moves rates in the month after the relevant birthday month", async () => {
    const birthdayMonth = await GET(
      createRequest(
        "?contributionMonth=2026-08&birthMonth=1971-08&citizenship=citizen",
      ),
    ).then((response) => response.json());
    const followingMonth = await GET(
      createRequest(
        "?contributionMonth=2026-09&birthMonth=1971-08&citizenship=citizen",
      ),
    ).then((response) => response.json());

    expect(birthdayMonth.id).toBe("above-50-to-55");
    expect(birthdayMonth.retirementAccount).toBe("RA");
    expect(birthdayMonth.retirementRouting).toEqual({
      type: "fixed",
      account: "RA",
    });
    expect(birthdayMonth.allocationRate).toHaveProperty("RA");
    expect(birthdayMonth.allocationRate).not.toHaveProperty("retirement");
    expect(followingMonth.id).toBe("above-55-to-60");
  });

  it("requires a contribution month and exactly one age input", async () => {
    const missingMonth = await GET(createRequest("?age=30"));
    const missingAge = await GET(createRequest("?contributionMonth=2026-08"));

    expect(missingMonth.status).toBe(422);
    expect(missingAge.status).toBe(422);
  });

  it("returns 404 for an unsupported policy month", async () => {
    const response = await GET(
      createRequest("?contributionMonth=2028-01&age=30"),
    );

    expect(response.status).toBe(404);
    expect((await response.json()).code).toBe("UNSUPPORTED_POLICY_MONTH");
  });
});
