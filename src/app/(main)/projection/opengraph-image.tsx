import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { Wordmark } from "@/lib/wordmark-mark";

export const alt = "Project Your CPF to Retirement, SimplyCPF";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const FONT_DIR = join(process.cwd(), "src/assets/fonts");

/**
 * Brand-kit OG card on paper. The guidelines forbid gradients and photo
 * backgrounds and cap weights at 600. The disclaimer is mandatory on any card
 * carrying a figure: shortening it is permitted, dropping it is not.
 */
export default async function Image() {
  const [regular, semibold] = await Promise.all([
    readFile(join(FONT_DIR, "Geist-Regular.ttf")),
    readFile(join(FONT_DIR, "Geist-SemiBold.ttf")),
  ]);

  // Fixed chart encoding: OA, SA/RA, MA.
  const accounts = [
    { label: "OA", color: BRAND.chart1 },
    { label: "SA", color: BRAND.chart2 },
    { label: "MA", color: BRAND.chart3 },
  ];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BRAND.bone,
        padding: "68px 76px",
        fontFamily: "Geist",
      }}
    >
      <Wordmark fontSize={44} />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 82,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.032em",
            color: BRAND.ink,
            maxWidth: 660,
          }}
        >
          Project your CPF to retirement
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 31,
            fontWeight: 400,
            lineHeight: 1.45,
            color: BRAND.textBody,
            maxWidth: 900,
          }}
        >
          See your OA, SA, MA and RA balances at 55, 65 and 70.
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
              <span style={{ fontSize: 24, color: BRAND.textSubtle }}>
                {account.label}
              </span>
            </div>
          ))}
        </div>
        <span style={{ fontSize: 20, color: BRAND.textSubtle }}>
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
