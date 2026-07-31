import {
  createOgImage,
  OG_IMAGE_ALT,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
} from "@/lib/og-image";

export default function Image() {
  return createOgImage({
    tone: "paper",
    title: "Your CPF, simplified.",
    subtitle:
      "Work out your contributions, project your balances, and see what changes at 55.",
  });
}

export const alt = OG_IMAGE_ALT;
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
