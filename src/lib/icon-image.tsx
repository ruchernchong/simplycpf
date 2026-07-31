import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

interface IconImageOptions {
  size: number;
}

/**
 * The brand icon: the wordmark lockup abstracted to a block of text with the
 * ruled line under it. Geometry matches public/simplycpf-icon.svg, scaled from
 * its 32px viewBox.
 */
export const createIconImage = ({ size }: IconImageOptions): ImageResponse => {
  const scale = size / 32;
  const px = (n: number) => n * scale;

  return new ImageResponse(
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: BRAND.ink,
        borderRadius: px(9),
        padding: `0 ${px(7)}px`,
      }}
    >
      <div
        style={{
          width: px(18),
          height: px(10),
          borderRadius: px(2.4),
          background: BRAND.bone,
        }}
      />
      <div
        style={{
          width: px(18),
          height: px(3.4),
          borderRadius: px(1.7),
          marginTop: px(3),
          background: BRAND.greenMid,
        }}
      />
    </div>,
    {
      width: size,
      height: size,
    },
  );
};
