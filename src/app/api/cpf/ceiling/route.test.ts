import type { NextRequest } from "next/server";
import { GET } from "./route";

function createRequest(query = ""): NextRequest {
  const url = new URL(`http://localhost/api/cpf/ceiling${query}`);
  return { nextUrl: url } as unknown as NextRequest;
}

describe("GET /api/cpf/ceiling", () => {
  it.each([
    ["2023-01", 6000],
    ["2023-09", 6300],
    ["2024-01", 6800],
    ["2025-01", 7400],
    ["2026-01", 8000],
    ["2027-01", 8000],
  ])("returns the official OW ceiling for %s", async (month, ceiling) => {
    const response = await GET(createRequest(`?contributionMonth=${month}`));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ordinaryWageCeiling).toBe(ceiling);
    expect(data.additionalWageCeiling).toBe(102000);
    expect(data.policy.status).toBe("official");
    expect(response.headers.get("cache-control")).toContain("s-maxage=86400");
  });

  it("accepts date as a deprecated alias", async () => {
    const response = await GET(createRequest("?date=2026-08-01"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.contributionMonth).toBe("2026-08");
    expect(data.warnings[0].code).toBe("legacy-input");
  });

  it("returns 422 for a missing or malformed contribution month", async () => {
    const missing = await GET(createRequest());
    const malformed = await GET(createRequest("?contributionMonth=2026-13"));

    expect(missing.status).toBe(422);
    expect(malformed.status).toBe(422);
  });

  it("returns 404 outside the published policy range", async () => {
    const before = await GET(createRequest("?contributionMonth=2022-12"));
    const after = await GET(createRequest("?contributionMonth=2028-01"));

    expect(before.status).toBe(404);
    expect(after.status).toBe(404);
  });
});
