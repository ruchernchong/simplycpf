import { BASE_URL } from "@/config";

interface CheatSheetEmailParams {
  downloadUrl?: string;
}

export interface ReadinessEmailParams {
  score: number;
  bucketLabel: string;
  headline: string;
  summary: string;
  nextSteps: string[];
  primaryActionLabel: string;
  primaryActionHref: string;
}

const wrapHtml = (title: string, content: string) => `
  <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 640px; margin: 0 auto; padding: 24px;">
    <p style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #0f766e; font-weight: 700; margin: 0 0 12px;">SimplyCPF</p>
    <h1 style="font-size: 28px; line-height: 1.2; margin: 0 0 16px;">${title}</h1>
    ${content}
    <p style="font-size: 14px; color: #475569; margin: 24px 0 0;">
      The core SimplyCPF tools stay free to use without sign-up. You only received this email because you requested this resource.
    </p>
  </div>
`;

export function createCheatSheetEmail({
  downloadUrl = `${BASE_URL}/api/lead-magnets/cpf-cheat-sheet`,
}: CheatSheetEmailParams) {
  return {
    subject: "Your SimplyCPF cheat sheet is ready",
    html: wrapHtml(
      "Your CPF cheat sheet is ready",
      `
        <p style="margin: 0 0 16px;">Thanks for requesting the SimplyCPF CPF Cheat Sheet. It brings together the numbers Singapore workers usually have to cross-check across multiple CPF pages.</p>
        <p style="margin: 0 0 16px;">Inside you will find contribution rates, OA / SA / MA distribution, PR graduated rates, interest tiers, retirement sums, Basic Healthcare Sum, and top-up limits in a single printable PDF.</p>
        <p style="margin: 0 0 24px;">
          <a href="${downloadUrl}" style="display: inline-block; background: #0f766e; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 999px; font-weight: 700;">Download the cheat sheet</a>
        </p>
        <p style="margin: 0;">If you want to model your own numbers next, try the <a href="${BASE_URL}/projection" style="color: #0f766e;">CPF projection calculator</a> or the <a href="${BASE_URL}/what-if" style="color: #0f766e;">what-if simulator</a>.</p>
      `,
    ),
    text: [
      "Your SimplyCPF CPF Cheat Sheet is ready.",
      "",
      "Download it here:",
      downloadUrl,
      "",
      "It covers contribution rates, OA / SA / MA distribution, PR graduated rates, interest tiers, retirement sums, BHS, and top-up limits.",
      "",
      `Projection calculator: ${BASE_URL}/projection`,
      `What-if simulator: ${BASE_URL}/what-if`,
    ].join("\n"),
  };
}

export function createReadinessEmail({
  score,
  bucketLabel,
  headline,
  summary,
  nextSteps,
  primaryActionLabel,
  primaryActionHref,
}: ReadinessEmailParams) {
  const safeNextSteps = nextSteps
    .map((step) => `<li style="margin: 0 0 8px;">${step}</li>`)
    .join("");

  return {
    subject: `Your SimplyCPF readiness score: ${score}/100`,
    html: wrapHtml(
      `Your retirement readiness score is ${score}/100`,
      `
        <p style="margin: 0 0 16px;"><strong>${bucketLabel}</strong></p>
        <p style="margin: 0 0 16px;"><strong>${headline}</strong></p>
        <p style="margin: 0 0 16px;">${summary}</p>
        <h2 style="font-size: 18px; margin: 24px 0 12px;">Suggested next steps</h2>
        <ul style="padding-left: 20px; margin: 0 0 24px;">${safeNextSteps}</ul>
        <p style="margin: 0 0 24px;">
          <a href="${BASE_URL}${primaryActionHref}" style="display: inline-block; background: #0f766e; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 999px; font-weight: 700;">${primaryActionLabel}</a>
        </p>
        <p style="margin: 0;">You can also keep the CPF reference numbers close by with the <a href="${BASE_URL}/cpf-cheat-sheet" style="color: #0f766e;">CPF cheat sheet</a>.</p>
      `,
    ),
    text: [
      `Your SimplyCPF retirement readiness score is ${score}/100.`,
      bucketLabel,
      "",
      headline,
      summary,
      "",
      "Suggested next steps:",
      ...nextSteps.map((step) => `- ${step}`),
      "",
      `${primaryActionLabel}: ${BASE_URL}${primaryActionHref}`,
      `CPF cheat sheet: ${BASE_URL}/cpf-cheat-sheet`,
    ].join("\n"),
  };
}
