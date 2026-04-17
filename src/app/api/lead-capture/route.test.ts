import type { NextRequest } from "next/server";
import { vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  sendTransactionalEmail: vi.fn(),
  upsertLeadContact: vi.fn(),
}));

vi.mock("@/lib/resend", () => ({
  sendTransactionalEmail: mocks.sendTransactionalEmail,
  upsertLeadContact: mocks.upsertLeadContact,
}));

describe("POST /api/lead-capture", () => {
  const createRequest = (body: unknown) => {
    return {
      json: async () => body,
    } as unknown as NextRequest;
  };

  beforeEach(() => {
    mocks.sendTransactionalEmail.mockReset();
    mocks.upsertLeadContact.mockReset();
  });

  it("accepts cheat sheet signups", async () => {
    const response = await POST(
      createRequest({
        email: "delivered@resend.dev",
        asset: "cheat_sheet",
        sourceRoute: "/cpf-cheat-sheet",
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mocks.upsertLeadContact).toHaveBeenCalledTimes(1);
    expect(mocks.sendTransactionalEmail).toHaveBeenCalledTimes(1);
  });

  it("accepts readiness report signups", async () => {
    const response = await POST(
      createRequest({
        email: "delivered@resend.dev",
        asset: "readiness_score",
        sourceRoute: "/retirement-readiness",
        readinessScore: 64,
        readinessBucket: "mid",
        interestArea: "projection",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.sendTransactionalEmail).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid emails", async () => {
    const response = await POST(
      createRequest({
        email: "not-an-email",
        asset: "cheat_sheet",
        sourceRoute: "/cpf-cheat-sheet",
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("email must be a valid email address");
  });

  it("rejects incomplete readiness payloads", async () => {
    const response = await POST(
      createRequest({
        email: "delivered@resend.dev",
        asset: "readiness_score",
        sourceRoute: "/retirement-readiness",
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("readinessScore is required for readiness_score");
  });
});
