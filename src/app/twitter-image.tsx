import {
  createOgImage,
  OG_IMAGE_ALT,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
} from "@/lib/og-image";
import { CPF_POLICY_CATALOGUE } from "@/policy";

export default function Image() {
  const retirementAge =
    CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;
  return createOgImage({
    tone: "ink",
    title: "Your CPF, simplified.",
    subtitle: `Work out contributions, project balances, and see what changes at ${retirementAge}.`,
  });
}

export const alt = OG_IMAGE_ALT;
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
