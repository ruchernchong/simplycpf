import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import CpfLifeContent from "@/components/cpf-life/cpf-life-content";
import CpfLifeDefinitionBlock from "@/components/seo/cpf-life-definition-block";
import CpfRetirementSumsBlock from "@/components/seo/cpf-retirement-sums-block";
import { StructuredData } from "@/components/seo/structured-data";
import { PageHeader } from "@/components/shared/section-header";
import { BASE_URL, WEBSITE_ID } from "@/config";
import faqCpfLifeData from "@/data/faq-cpf-life.json";

export const metadata: Metadata = {
  title: "CPF LIFE 2026 Reference: Published Standard Plan Payouts",
  description:
    "Review CPF Board's published 2026 CPF LIFE Standard Plan reference rows, understand the three plan shapes, and open CPF's personalised Retirement Payout Planner.",
  keywords:
    "CPF LIFE reference, CPF LIFE payout table 2026, CPF LIFE Standard plan, CPF LIFE Escalating plan, CPF Retirement Payout Planner",
  alternates: {
    canonical: "/cpf-life",
  },
  openGraph: {
    title: "CPF LIFE 2026 Reference: Published Standard Plan Payouts",
    description:
      "Review CPF Board's published Standard Plan payout reference and learn how the three CPF LIFE plans differ.",
    url: `${BASE_URL}/cpf-life`,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "CPF LIFE 2026 reference, SimplyCPF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF LIFE 2026 Reference: Published Standard Plan Payouts",
    description:
      "Review CPF Board's published Standard Plan payout reference and learn how the three CPF LIFE plans differ.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

const schema: Graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/cpf-life/#webpage`,
      name: "CPF LIFE 2026 Reference",
      description:
        "CPF Board's published 2026 Standard Plan payout reference rows with factual descriptions of the Standard, Escalating, and Basic plans.",
      url: `${BASE_URL}/cpf-life`,
      inLanguage: "en-SG",
      isPartOf: { "@id": WEBSITE_ID },
      keywords:
        "CPF LIFE reference, CPF LIFE payout table 2026, Standard plan, Escalating plan, Basic plan",
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1"] },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "CPF LIFE",
          item: `${BASE_URL}/cpf-life`,
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqCpfLifeData.map(({ question, answer }) => ({
        "@type": "Question" as const,
        name: question,
        acceptedAnswer: { "@type": "Answer" as const, text: answer },
      })),
    },
    {
      "@type": "SoftwareApplication",
      name: "SimplyCPF CPF LIFE Reference",
      url: `${BASE_URL}/cpf-life`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "SGD" },
      featureList: [
        "Show CPF Board's published 2026 Standard Plan reference rows",
        "Explain Standard, Escalating, and Basic plan characteristics",
        "Link to CPF's personalised Retirement Payout Planner",
      ],
    },
  ],
};

export default function CpfLifePage() {
  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-8">
        <PageHeader
          eyebrow="CPF LIFE"
          title="Published reference rows, not a personalised quote"
          lede="CPF Board publishes Standard Plan reference payouts for members turning 55 in 2026. Use them to understand the scale, then use CPF's Retirement Payout Planner for a personalised estimate. The other plan types are described by their official characteristics, not invented ratios."
        />
        <CpfLifeContent />
        <CpfLifeDefinitionBlock />
        <CpfRetirementSumsBlock />
      </div>
    </>
  );
}
