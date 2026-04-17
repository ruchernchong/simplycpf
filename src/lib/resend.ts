import { AppError } from "@/lib/error-handler";

const RESEND_API_BASE = "https://api.resend.com";

export interface LeadCapturePayload {
  email: string;
  asset: "cheat_sheet" | "readiness_score";
  sourceRoute: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  readinessScore?: number;
  readinessBucket?: "low" | "mid" | "high";
  interestArea?: "projection" | "cpf-life" | "pr-rates";
}

interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

function getRequiredEnv(name: "RESEND_API_KEY" | "RESEND_FROM_EMAIL") {
  const value = process.env[name];

  if (!value) {
    throw new AppError(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getHeaders() {
  return {
    Authorization: `Bearer ${getRequiredEnv("RESEND_API_KEY")}`,
    "Content-Type": "application/json",
  };
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (typeof data?.error?.message === "string") {
      return data.error.message;
    }
  } catch {
    // Ignore JSON parse errors and fall back to status text.
  }

  return response.statusText || "Unknown Resend error";
}

function buildProperties(payload: LeadCapturePayload): Record<string, string> {
  return {
    lead_asset: payload.asset,
    source_route: payload.sourceRoute,
    ...(payload.referrer ? { referrer: payload.referrer } : {}),
    ...(payload.utmSource ? { utm_source: payload.utmSource } : {}),
    ...(payload.utmMedium ? { utm_medium: payload.utmMedium } : {}),
    ...(payload.utmCampaign ? { utm_campaign: payload.utmCampaign } : {}),
    ...(payload.utmContent ? { utm_content: payload.utmContent } : {}),
    ...(payload.readinessScore !== undefined
      ? { readiness_score: String(payload.readinessScore) }
      : {}),
    ...(payload.readinessBucket
      ? { readiness_bucket: payload.readinessBucket }
      : {}),
    ...(payload.interestArea ? { interest_area: payload.interestArea } : {}),
  };
}

export async function upsertLeadContact(
  payload: LeadCapturePayload,
): Promise<void> {
  const createResponse = await fetch(`${RESEND_API_BASE}/contacts`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      email: payload.email,
      unsubscribed: false,
      properties: buildProperties(payload),
    }),
  });

  if (createResponse.ok) {
    return;
  }

  const updateResponse = await fetch(
    `${RESEND_API_BASE}/contacts/${encodeURIComponent(payload.email)}`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        unsubscribed: false,
        properties: buildProperties(payload),
      }),
    },
  );

  if (!updateResponse.ok) {
    throw new AppError(
      `Failed to save Resend contact: ${await parseError(updateResponse)}`,
    );
  }
}

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
}: SendEmailPayload): Promise<void> {
  const fromEmail = getRequiredEnv("RESEND_FROM_EMAIL");
  const replyTo = process.env.RESEND_REPLY_TO_EMAIL;

  const response = await fetch(`${RESEND_API_BASE}/emails`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      from: `SimplyCPF <${fromEmail}>`,
      to: [to],
      subject,
      html,
      text,
      ...(replyTo ? { reply_to: [replyTo] } : {}),
    }),
  });

  if (!response.ok) {
    throw new AppError(`Failed to send email: ${await parseError(response)}`);
  }
}
