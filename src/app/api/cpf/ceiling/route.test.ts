import type { NextRequest } from "next/server";
import { vi } from "vitest";
import { GET } from "./route";

// Mock data for cpfIncomeCeilings
vi.mock("@/data", () => ({
  cpfIncomeCeilings: {
    "2023-01-01": 6000,
    "2023-09-01": 6300,
    "2024-01-01": 6800,
    "2025-01-01": 7400,
    "2026-01-01": 8000,
  },
}));

vi.mock("@/constants", () => ({
  DEFAULT_CPF_INCOME_CEILING: 6000,
  CPF_INCOME_CEILING: {
    "2023-01-01": 6000,
    "2023-09-01": 6300,
    "2024-01-01": 6800,
    "2025-01-01": 7400,
    "2026-01-01": 8000,
  },
}));

describe("GET /api/cpf/ceiling", () => {
  const createRequest = (url: string) => {
    return {
      nextUrl: {
        searchParams: new URL(url, "http://localhost").searchParams,
      },
    } as NextRequest;
  };

  it.each([
    { date: "2023-01-01", ceiling: 6000 },
    { date: "2023-09-01", ceiling: 6300 },
    { date: "2024-01-01", ceiling: 6800 },
    { date: "2025-01-01", ceiling: 7400 },
    { date: "2026-01-01", ceiling: 8000 },
  ])("should return the ceiling as $ceiling for $date", async ({
    date,
    ceiling,
  }) => {
    const req = createRequest(`/api/cpf/ceiling?date=${date}`);
    const res = await GET(req).then((res) => res.json());
    expect(res).toEqual({ date, ceiling });
  });

  it("uses today's date if no date is provided", async () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
    const req = createRequest("/api/cpf/ceiling");
    const response = await GET(req);
    expect((await response.json()).date).toEqual(dateStr);
  });

  it("returns the correct ceiling for dates before 2023-02-01", async () => {
    const date = "2023-02-01";
    const req = createRequest(`/api/cpf/ceiling?date=${date}`);
    const response = await GET(req);
    expect(await response.json()).toEqual({
      date,
      ceiling: 6000,
    });
  });
});
