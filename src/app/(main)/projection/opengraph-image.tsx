import {
  createOgImage,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
} from "@/lib/og-image";

export const alt = "Project Your CPF to Retirement, SimplyCPF";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  return createOgImage({
    tone: "paper",
    title: "Project your CPF to retirement",
    subtitle: "See your OA, SA, MA and RA balances at 55, 65 and 70.",
  });
}
