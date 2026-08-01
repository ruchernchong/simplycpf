import {
  createOgImage,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
} from "@/lib/og-image";
import { CPF_POLICY_CATALOGUE } from "@/policy";

export const alt = "Project Your CPF to Retirement, SimplyCPF";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  const ages = CPF_POLICY_CATALOGUE.rules.lifecycleAges;
  return createOgImage({
    tone: "paper",
    title: "Project your CPF to retirement",
    subtitle: `See OA, SA, MA and RA balances at ${ages.retirementAccountCreated}, ${ages.cpfLifePayoutEligibility} and ${ages.latestCpfLifePayoutStart}.`,
  });
}
