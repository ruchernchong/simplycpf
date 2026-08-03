import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import CpfCheckContent from "@/components/check/cpf-check-content";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, OG_BASE, WEBSITE_ID } from "@/config";

const PAGE_URL = `${BASE_URL}/cpf-check`;

export const metadata: Metadata = {
  title: "Five things worth knowing about CPF",
  description:
    "Tick what you already know about CPF and we will point you at the screen that explains each of the rest. Nothing is recorded and no email is asked for.",
  keywords:
    "CPF check, CPF knowledge, what happens at 55, accrued interest, CPF LIFE plans, payout eligibility age",
  alternates: {
    canonical: "/cpf-check",
  },
  openGraph: {
    ...OG_BASE,
    description:
      "Tick what you already know about CPF and we will point you at the screen that explains each of the rest.",
    url: PAGE_URL,
  },
};

const schema: Graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}/#webpage`,
      name: "Five things worth knowing about CPF",
      description:
        "A short self-check covering the age 55 account change, accrued interest on housing, the three CPF LIFE plans, retirement versus payout age, and the employer share.",
      url: PAGE_URL,
      inLanguage: "en-SG",
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
