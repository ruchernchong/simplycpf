import type { NextRequest } from "next/server";
import { GET } from "./route";

function createRequest(query = ""): NextRequest {
  const url = new URL(`http://localhost/api/cpf/age-groups${query}`);
  return { nextUrl: url } as unknown as NextRequest;
}

describe("GET /api/cpf/age-groups", () => {
  it("returns eight official allocation bands with provenance", async () => {
    const response = await GET(
      createRequest("?contributionMonth=2026-08&citizenship=citizen"),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ageGroups).toHaveLength(8);
    expect(data.schedule.id).toBe("cpf-2026");
    expect(data.policy.contribution.status).toBe("official");
    expect(data.policy.allocation.verifiedAt).toBe("2026-08-01");
    expect(response.headers.get("cache-control")).toContain("s-maxage=86400");
  });

  it("uses inclusive upper bounds and makes age-55 routing explicit", async () => {
    const response = await GET(
      createRequest("?contributionMonth=2026-08&citizenship=citizen"),
    );
    const data = await response.json();

    expect(data.ageGroups[0]).toMatchObject({
      id: "35-and-below",
      maxAgeInclusive: 35,
      retirementAccount: "SA",
      retirementRouting: { type: "fixed", account: "SA" },
    });
    expect(data.ageGroups[3]).toMatchObject({
      id: "above-50-to-55",
      minAgeExclusive: 50,
      maxAgeInclusive: 55,
      retirementAccount: "age-dependent",
      retirementRouting: {
        type: "age-dependent",
        thresholdAge: 55,
        belowThresholdAccount: "SA",
        atOrAboveThresholdAccount: "RA",
      },
    });
    expect(data.ageGroups[3].allocationRate).toHaveProperty("retirement");
    expect(data.ageGroups[3].allocationRate).not.toHaveProperty("SA");
    expect(data.ageGroups[3].allocationRate).not.toHaveProperty("RA");
    expect(data.ageGroups[4]).toMatchObject({
      id: "above-55-to-60",
      minAgeExclusive: 55,
      maxAgeInclusive: 60,
      retirementAccount: "RA",
      retirementRouting: { type: "fixed", account: "RA" },
    });
    expect(data.ageGroups[4].allocationRate).toHaveProperty("RA");
    expect(data.ageGroups[4].allocationRate).not.toHaveProperty("SA");
  });

  it("keeps every retirement allocation in SA before the 2025 closure", async () => {
    const response = await GET(
      createRequest("?contributionMonth=2024-08&citizenship=citizen"),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(
      data.ageGroups.every(
        (group: { retirementRouting: unknown; retirementAccount: string }) =>
          group.retirementAccount === "SA" &&
          JSON.stringify(group.retirementRouting) ===
            JSON.stringify({ type: "fixed", account: "SA" }),
      ),
    ).toBe(true);
  });

  it("resolves the requested citizenship schedule", async () => {
    const response = await GET(
      createRequest("?contributionMonth=2027-01&citizenship=spr-year1"),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.citizenship).toBe("spr-year1");
    expect(data.ageGroups[0].contributionRate).toEqual({
      employee: 0.05,
      employer: 0.04,
    });
  });

  it("returns 404 instead of fabricating an unsupported schedule", async () => {
    const response = await GET(
      createRequest("?contributionMonth=2028-01&citizenship=citizen"),
    );

    expect(response.status).toBe(404);
    expect((await response.json()).code).toBe("UNSUPPORTED_POLICY_MONTH");
  });
});
