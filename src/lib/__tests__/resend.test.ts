import { AppError } from "@/lib/error-handler";
import {
  type LeadCapturePayload,
  sendTransactionalEmail,
  upsertLeadContact,
} from "../resend";

describe("resend helpers", () => {
  const originalEnv = { ...process.env };
  const fetchMock = vi.fn();

  const payload: LeadCapturePayload = {
    email: "delivered@resend.dev",
    asset: "cheat_sheet",
    sourceRoute: "/cpf-cheat-sheet",
    utmSource: "linkedin",
  };

  beforeEach(() => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM_EMAIL = "hello@simplycpf.com";
    delete process.env.RESEND_REPLY_TO_EMAIL;
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("creates a new contact on the first request when Resend accepts it", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "contact_123" }), { status: 200 }),
    );

    await upsertLeadContact(payload);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/contacts",
      expect.objectContaining({
        method: "POST",
      }),
    );

    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);

    expect(requestBody).toEqual({
      email: "delivered@resend.dev",
      unsubscribed: false,
      properties: {
        lead_asset: "cheat_sheet",
        source_route: "/cpf-cheat-sheet",
        utm_source: "linkedin",
      },
    });
  });

  it("falls back to updating the contact when the initial create request fails", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Contact already exists" }), {
          status: 409,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "contact_123" }), { status: 200 }),
      );

    await upsertLeadContact({
      ...payload,
      asset: "readiness_score",
      readinessScore: 72,
      readinessBucket: "high",
      interestArea: "projection",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe(
      "https://api.resend.com/contacts/delivered%40resend.dev",
    );

    const updateBody = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    expect(updateBody.properties.readiness_score).toBe("72");
    expect(updateBody.properties.readiness_bucket).toBe("high");
    expect(updateBody.properties.interest_area).toBe("projection");
  });

  it("throws a helpful error when both create and update fail", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Contact already exists" }), {
          status: 409,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Update failed" }), {
          status: 500,
          statusText: "Internal Server Error",
        }),
      );

    await expect(upsertLeadContact(payload)).rejects.toThrow(
      "Failed to save Resend contact: Update failed",
    );
  });

  it("sends transactional emails with optional reply-to support", async () => {
    process.env.RESEND_REPLY_TO_EMAIL = "reply@simplycpf.com";
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "email_123" }), { status: 200 }),
    );

    await sendTransactionalEmail({
      to: "delivered@resend.dev",
      subject: "Test email",
      html: "<p>Hello</p>",
      text: "Hello",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
      }),
    );

    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(requestBody.from).toBe("SimplyCPF <hello@simplycpf.com>");
    expect(requestBody.reply_to).toEqual(["reply@simplycpf.com"]);
  });

  it("throws if required Resend environment variables are missing", async () => {
    delete process.env.RESEND_FROM_EMAIL;

    await expect(
      sendTransactionalEmail({
        to: "delivered@resend.dev",
        subject: "Test email",
        html: "<p>Hello</p>",
        text: "Hello",
      }),
    ).rejects.toBeInstanceOf(AppError);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
