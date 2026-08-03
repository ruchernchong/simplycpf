import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { Wordmark } from "@/lib/wordmark-mark";

export const alt = "SimplyCPF. Your CPF, simplified.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const FONT_DIR = join(process.cwd(), "src/assets/fonts");

/**
 * Brand-kit OG card on ink. Forest reads as almost black against ink, so the
 * wordmark reverses and every chart slot steps up to its on-ink value. The
 * disclaimer is mandatory on any card carrying a figure: shortening it is
 * permitted, dropping it is not.
 */
export default async function Image() {
  const [regular, semibold] = await Promise.all([
    readFile(join(FONT_DIR, "Geist-Regular.ttf")),
    readFile(join(FONT_DIR, "Geist-SemiBold.ttf")),
  ]);

  // Fixed chart encoding: OA, SA/RA, MA.
  const accounts = [
    { label: "OA", color: BRAND.chart1OnInk },
    { label: "SA", color: BRAND.chart2OnInk },
    { label: "MA", color: BRAND.chart3OnInk },
  ];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BRAND.ink,
        padding: "68px 76px",
        fontFamily: "Geist",
      }}
    >
      <Wordmark fontSize={44} reversed />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 82,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.032em",
            color: BRAND.bone,
            maxWidth: 660,
          }}
        >
          Your CPF, simplified.
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 31,
            fontWeight: 400,
            lineHeight: 1.45,
            color: BRAND.tintOnInk,
            maxWidth: 900,
          }}
        >
          Work out your contributions, project your balances, and see what
          changes at 55.
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
              <span style={{ fontSize: 24, color: BRAND.tintOnInkMuted }}>
                {account.label}
              </span>
            </div>
          ))}
        </div>
        <span style={{ fontSize: 20, color: BRAND.tintOnInkMuted }}>
          Independent · not affiliated with the CPF Board · estimates, not
          financial advice
        </span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
