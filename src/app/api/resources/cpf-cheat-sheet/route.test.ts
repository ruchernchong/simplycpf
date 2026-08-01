import { vi } from "vitest";

const mocks = vi.hoisted(() => ({
  checkBotId: vi.fn(),
  renderToBuffer: vi.fn(),
}));

vi.mock("botid/server", () => ({
  checkBotId: mocks.checkBotId,
}));

vi.mock("@react-pdf/renderer", () => ({
  renderToBuffer: mocks.renderToBuffer,
}));

vi.mock("@/components/pdf/cpf-cheat-sheet-pdf", () => ({
  CpfCheatSheetPdf: () => null,
}));

import { GET } from "./route";

describe("GET /api/resources/cpf-cheat-sheet", () => {
  it("returns a downloadable PDF response for non-bot traffic", async () => {
    mocks.checkBotId.mockResolvedValueOnce({ isBot: false });
    mocks.renderToBuffer.mockResolvedValueOnce(Buffer.from("fake-pdf"));

    const response = await GET();
    const body = await response.arrayBuffer();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain(
      "simplycpf-cpf-cheat-sheet.pdf",
    );
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    );
    expect(body.byteLength).toBeGreaterThan(0);
  });

  it("blocks bot traffic before rendering the PDF", async () => {
    mocks.checkBotId.mockResolvedValueOnce({ isBot: true });

    const response = await GET();

    expect(response.status).toBe(403);
    expect(mocks.renderToBuffer).not.toHaveBeenCalled();
  });
});
