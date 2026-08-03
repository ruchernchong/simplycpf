import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

/**
 * The brand icon: the wordmark lockup abstracted to a block of text with the
 * ruled line under it. Geometry matches public/simplycpf-icon.svg, whose
 * viewBox is 32 wide, so these are its numbers one to one.
 */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: BRAND.ink,
        borderRadius: 9,
        padding: "0 7px",
      }}
    >
      <div
        style={{
          width: 18,
          height: 10,
          borderRadius: 2.4,
          background: BRAND.bone,
        }}
      />
      <div
        style={{
          width: 18,
          height: 3.4,
          borderRadius: 1.7,
          marginTop: 3,
          background: BRAND.greenMid,
        }}
      />
    </div>,
    size,
  );
}
