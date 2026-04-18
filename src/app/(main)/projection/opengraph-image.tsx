import { ImageResponse } from "next/og";
import { LogoMark } from "@/lib/logo-mark";

export const alt = "Project Your CPF to Retirement - SimplyCPF";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const theme = {
  background: "#f8fafc",
  logoBackground: "#ffffff",
  logoBorder: "#e2e8f0",
  barColor: "#64748b",
  accentColor: "#0d9488",
  titleColor: "#0f172a",
  subtitleColor: "#475569",
  chipBackground: "#ffffff",
  chipTextColor: "#334155",
};

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: theme.background,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.logoBackground,
          borderRadius: 24,
          padding: 24,
          marginBottom: 32,
          border: `2px solid ${theme.logoBorder}`,
        }}
      >
        <LogoMark
          size={120}
          barColor={theme.barColor}
          accentColor={theme.accentColor}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <h1
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: theme.titleColor,
            margin: 0,
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          Project Your CPF to Retirement
        </h1>
        <p
          style={{
            fontSize: 28,
            color: theme.subtitleColor,
            margin: 0,
            maxWidth: 700,
            textAlign: "center",
          }}
        >
          See your OA, SA, MA, and RA balances at 55, 65, and 70
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 32,
          marginTop: 48,
        }}
      >
        {[
          { label: "OA", color: theme.barColor },
          { label: "SA", color: theme.accentColor },
          { label: "MA", color: theme.barColor },
        ].map((account) => (
          <div
            key={account.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              background: theme.chipBackground,
              borderRadius: 12,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: account.color,
              }}
            />
            <span
              style={{
                color: theme.chipTextColor,
                fontSize: 20,
              }}
            >
              {account.label}
            </span>
          </div>
        ))}
      </div>
    </div>,
    {
      ...size,
    },
  );
}
