import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

/**
 * The brand icon at touch-icon size. Geometry matches public/simplycpf-icon.svg,
 * scaled from its 32-wide viewBox: every number below is the viewBox value
 * times 180 / 32.
 */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: BRAND.ink,
        borderRadius: 50.625,
        padding: "0 39.375px",
      }}
    >
      <div
        style={{
          width: 101.25,
          height: 56.25,
          borderRadius: 13.5,
          background: BRAND.bone,
        }}
      />
      <div
        style={{
          width: 101.25,
          height: 19.125,
          borderRadius: 9.5625,
          marginTop: 16.875,
          background: BRAND.greenMid,
        }}
      />
    </div>,
    size,
  );
}
