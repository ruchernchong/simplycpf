import { GET } from "./route";

describe("GET /api/cpf/ceiling/timeline", () => {
  it("should return timeline of income ceiling changes", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it("should return timeline entries with correct structure", async () => {
    const response = await GET();
    const data = await response.json();

    for (const entry of data) {
      expect(entry).toHaveProperty("date");
      expect(entry).toHaveProperty("ceiling");
      expect(typeof entry.date).toBe("string");
      expect(typeof entry.ceiling).toBe("number");
    }
  });

  it("should return timeline sorted by date ascending", async () => {
    const response = await GET();
    const data = await response.json();

    for (let i = 1; i < data.length; i++) {
      const prevDate = new Date(data[i - 1].date).getTime();
      const currDate = new Date(data[i].date).getTime();
      expect(currDate).toBeGreaterThan(prevDate);
    }
  });

  it.each([
    { date: "2023-01-01", ceiling: 6000 },
    { date: "2023-09-01", ceiling: 6300 },
    { date: "2024-01-01", ceiling: 6800 },
    { date: "2025-01-01", ceiling: 7400 },
    { date: "2026-01-01", ceiling: 8000 },
  ])("should include ceiling $ceiling for date $date", async ({
    date,
    ceiling,
  }) => {
    const response = await GET();
    const data = await response.json();

    const entry = data.find((e: { date: string }) => e.date === date);
    expect(entry).toBeDefined();
    expect(entry.ceiling).toBe(ceiling);
  });
});
