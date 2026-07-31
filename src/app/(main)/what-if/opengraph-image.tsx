import {
  createOgImage,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
} from "@/lib/og-image";

export const alt = "Compare CPF Scenarios, SimplyCPF";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  return createOgImage({
    tone: "paper",
    title: "Compare CPF scenarios",
    subtitle: "Salary changes, transfers, top-ups, see the difference.",
  });
}
