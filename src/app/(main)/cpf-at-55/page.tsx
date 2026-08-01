import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import At55Content from "@/components/at-55/at-55-content";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, OG_IMAGE, WEBSITE_ID } from "@/config";
import { CPF_POLICY_CATALOGUE } from "@/policy";

const PAGE_URL = `${BASE_URL}/cpf-at-55`;
const retirementAge =
  CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;
const closureDate =
  CPF_POLICY_CATALOGUE.rules.specialAccountClosure.effectiveDate;
const PAGE_TITLE = `What happens to your CPF at ${retirementAge}`;
const PAGE_DESCRIPTION = `Your Special Account closes from age ${retirementAge} and a Retirement Account is created. See the official routing and an explicitly assumption-labelled projection.`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: `CPF at ${retirementAge}, Special Account closure, Retirement Account, CPF SA closure ${closureDate}, Full Retirement Sum, CPF withdrawal`,
  alternates: {
    canonical: "/cpf-at-55",
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

const schema: Graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}/#webpage`,
      name: PAGE_TITLE,
      description: `How the Special Account closure from age ${retirementAge} works, how RA is filled towards the applicable retirement sum, and what routes to OA.`,
      url: PAGE_URL,
      inLanguage: "en-SG",
      dateModified:
        CPF_POLICY_CATALOGUE.metadata["cpf-special-account-closure"].verifiedAt,
      isPartOf: { "@id": WEBSITE_ID },
      keywords: `CPF at ${retirementAge}, Special Account closure, Retirement Account, Full Retirement Sum`,
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1"],
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: `At ${retirementAge}`,
          item: PAGE_URL,
        },
      ],
    },
  ],
};

export default function CpfAt55Page() {
  return (
    <>
      <StructuredData data={schema} />
      <At55Content />
    </>
  );
}
