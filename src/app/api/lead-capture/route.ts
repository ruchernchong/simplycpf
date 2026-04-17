import { type NextRequest, NextResponse } from "next/server";
import { buildReadinessEmailData } from "@/lib/calculate-retirement-readiness";
import {
  createCheatSheetEmail,
  createReadinessEmail,
} from "@/lib/email-templates";
import { AppError, handleError } from "@/lib/error-handler";
import {
  type LeadCapturePayload,
  sendTransactionalEmail,
  upsertLeadContact,
} from "@/lib/resend";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_INTEREST_AREAS = new Set(["projection", "cpf-life", "pr-rates"]);
const VALID_BUCKETS = new Set(["low", "mid", "high"]);

function assertValidLeadCapturePayload(
  payload: Partial<LeadCapturePayload>,
): asserts payload is LeadCapturePayload {
  if (!payload.email || !EMAIL_REGEX.test(payload.email)) {
    throw new AppError("email must be a valid email address");
  }

  if (!payload.sourceRoute) {
    throw new AppError("sourceRoute is required");
  }

  if (payload.asset !== "cheat_sheet" && payload.asset !== "readiness_score") {
    throw new AppError("asset must be cheat_sheet or readiness_score");
  }

  if (payload.asset === "readiness_score") {
    if (typeof payload.readinessScore !== "number") {
      throw new AppError("readinessScore is required for readiness_score");
    }

    if (
      !payload.readinessBucket ||
      !VALID_BUCKETS.has(payload.readinessBucket)
    ) {
      throw new AppError("readinessBucket must be low, mid, or high");
    }

    if (
      !payload.interestArea ||
      !VALID_INTEREST_AREAS.has(payload.interestArea)
    ) {
      throw new AppError(
        "interestArea must be projection, cpf-life, or pr-rates",
      );
    }
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = (await request.json()) as Partial<LeadCapturePayload>;

    assertValidLeadCapturePayload(payload);

    await upsertLeadContact(payload);

    let email = createCheatSheetEmail({});

    if (payload.asset === "readiness_score") {
      const { readinessScore, readinessBucket, interestArea } = payload;

      if (
        typeof readinessScore !== "number" ||
        !readinessBucket ||
        !interestArea
      ) {
        throw new AppError("Readiness report inputs are incomplete");
      }

      email = createReadinessEmail(
        buildReadinessEmailData({
          score: readinessScore,
          bucket: readinessBucket,
          interestArea,
        }),
      );
    }

    await sendTransactionalEmail({
      to: payload.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    return NextResponse.json({
      ok: true,
      message:
        payload.asset === "cheat_sheet"
          ? "Cheat sheet email sent"
          : "Readiness report email sent",
    });
  } catch (error) {
    const appError = handleError(error);

    return NextResponse.json(
      { error: appError.message },
      {
        status: error instanceof AppError ? 400 : 500,
      },
    );
  }
}
