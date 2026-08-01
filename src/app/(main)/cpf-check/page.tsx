import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import CpfCheckContent from "@/components/check/cpf-check-content";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, OG_IMAGE, WEBSITE_ID } from "@/config";
import { CPF_POLICY_CATALOGUE } from "@/policy";

const PAGE_URL = `${BASE_URL}/cpf-check`;
const retirementAge =
  CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;

export const metadata: Metadata = {
  title: "Five things worth knowing about CPF",
  description:
    "Tick what you already know about CPF and we will point you at the screen that explains each of the rest. Nothing is recorded and no email is asked for.",
  keywords: `CPF check, CPF knowledge, what happens at ${retirementAge}, accrued interest, CPF LIFE plans, payout eligibility age`,
  alternates: {
    canonical: "/cpf-check",
  },
  openGraph: {
    title: "Five things worth knowing about CPF",
    description:
      "Tick what you already know about CPF and we will point you at the screen that explains each of the rest.",
    url: PAGE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Five things worth knowing about CPF",
    description:
      "Tick what you already know about CPF and we will point you at the screen that explains each of the rest.",
    images: [OG_IMAGE.url],
  },
};

const schema: Graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}/#webpage`,
      name: "Five things worth knowing about CPF",
      description: `A SimplyCPF self-check covering the age ${retirementAge} account change, accrued interest on housing, CPF LIFE plan characteristics, retirement versus payout age, and the employer share.`,
      url: PAGE_URL,
      inLanguage: "en-SG",
      dateModified:
        CPF_POLICY_CATALOGUE.metadata["cpf-housing-refunds"].verifiedAt,
      isPartOf: { "@id": WEBSITE_ID },
      keywords:
        "CPF check, CPF knowledge, accrued interest, CPF LIFE plans, payout eligibility age",
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1"] },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Check", item: PAGE_URL },
      ],
    },
  ],
};

export default function CpfCheckPage() {
  return (
    <>
      <StructuredData data={schema} />
      <CpfCheckContent />
    </>
  );
}
