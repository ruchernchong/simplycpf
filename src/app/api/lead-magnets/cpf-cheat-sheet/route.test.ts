import { vi } from "vitest";

const mocks = vi.hoisted(() => ({
  renderToBuffer: vi.fn(),
}));

vi.mock("@react-pdf/renderer", () => ({
  renderToBuffer: mocks.renderToBuffer,
}));

vi.mock("@/components/pdf/cpf-cheat-sheet-pdf", () => ({
  CpfCheatSheetPdf: () => null,
}));

import { GET } from "./route";

describe("GET /api/lead-magnets/cpf-cheat-sheet", () => {
  it("returns a downloadable PDF response", async () => {
    mocks.renderToBuffer.mockResolvedValueOnce(Buffer.from("fake-pdf"));

    const response = await GET();
    const body = await response.arrayBuffer();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain(
      "simplycpf-cpf-cheat-sheet.pdf",
    );
    expect(body.byteLength).toBeGreaterThan(0);
  });
});
