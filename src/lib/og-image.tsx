import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { Wordmark } from "@/lib/wordmark-mark";

export const OG_IMAGE_ALT = "SimplyCPF. Your CPF, simplified.";
export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};
export const OG_IMAGE_CONTENT_TYPE = "image/png";

/**
 * The disclaimer is mandatory on any card carrying a figure. Shortening is
 * permitted by the brand guidelines; dropping it is not.
 */
export const OG_DISCLAIMER =
  "Independent · not affiliated with the CPF Board · estimates, not financial advice";

const FONT_DIR = join(process.cwd(), "src/assets/fonts");

async function geistFonts() {
  const [regular, semibold] = await Promise.all([
    readFile(join(FONT_DIR, "Geist-Regular.ttf")),
    readFile(join(FONT_DIR, "Geist-SemiBold.ttf")),
  ]);

  return [
    {
      name: "Geist",
      data: regular,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Geist",
      data: semibold,
      weight: 600 as const,
      style: "normal" as const,
    },
  ];
}

export interface OgImageTheme {
  /** "paper" for page cards, "ink" whenever a figure is the headline. */
  tone?: "paper" | "ink";
  title?: string;
  subtitle?: string;
}

/**
 * Brand-kit OG card, 1200x630. Paper or ink only, the guidelines forbid
 * gradients and photo backgrounds. Weights are capped at 600.
 */
export const createOgImage = async (
  theme: OgImageTheme = {},
): Promise<ImageResponse> => {
  const {
    tone = "paper",
    title = "SimplyCPF",
    subtitle = "Your CPF, simplified.",
  } = theme;

  const isInk = tone === "ink";
  const background = isInk ? BRAND.ink : BRAND.bone;
  const titleColor = isInk ? BRAND.bone : BRAND.ink;
  const subtitleColor = isInk ? BRAND.tintOnInk : BRAND.textBody;
  const footerColor = isInk ? BRAND.tintOnInkMuted : BRAND.textSubtle;

  // Fixed chart encoding: OA, SA/RA, MA. Lifted on ink, where forest reads
  // as almost black against the background.
  const accounts = [
    { label: "OA", color: isInk ? BRAND.chart1OnInk : BRAND.chart1 },
    { label: "SA", color: isInk ? BRAND.chart2OnInk : BRAND.chart2 },
    { label: "MA", color: isInk ? BRAND.chart3OnInk : BRAND.chart3 },
  ];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background,
        padding: "68px 76px",
        fontFamily: "Geist",
      }}
    >
      <Wordmark fontSize={44} reversed={isInk} />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 82,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.032em",
            color: titleColor,
            maxWidth: 15 * 44,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 31,
            fontWeight: 400,
            lineHeight: 1.45,
            color: subtitleColor,
            maxWidth: 900,
          }}
        >
          {subtitle}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 26 }}>
          {accounts.map((account) => (
            <div
              key={account.label}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: account.color,
                }}
              />
              <span style={{ fontSize: 24, color: footerColor }}>
                {account.label}
              </span>
            </div>
          ))}
        </div>
        <span style={{ fontSize: 20, color: footerColor }}>
          {OG_DISCLAIMER}
        </span>
      </div>
    </div>,
    {
      ...OG_IMAGE_SIZE,
      fonts: await geistFonts(),
    },
  );
};
