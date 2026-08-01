import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import CpfLifeContent from "@/components/cpf-life/cpf-life-content";
import CpfLifeDefinitionBlock from "@/components/seo/cpf-life-definition-block";
import CpfRetirementSumsBlock from "@/components/seo/cpf-retirement-sums-block";
import { StructuredData } from "@/components/seo/structured-data";
import { PageHeader } from "@/components/shared/section-header";
import { BASE_URL, WEBSITE_ID } from "@/config";
import { faqCpfLifeData } from "@/data/cpf-faqs";
import { CPF_POLICY_CATALOGUE } from "@/policy";

const reference = CPF_POLICY_CATALOGUE.cpfLife.reference;
const retirementAge =
  CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;

export const metadata: Metadata = {
  title: `CPF LIFE ${reference.year} Reference: Published ${reference.plan} Plan Payouts`,
  description: `Review CPF Board's published ${reference.year} CPF LIFE ${reference.plan} Plan reference rows, understand the plan characteristics, and open CPF's personalised planner.`,
  keywords: `CPF LIFE reference, CPF LIFE payout table ${reference.year}, CPF LIFE ${reference.plan} plan, CPF LIFE Escalating plan, CPF Retirement Payout Planner`,
  alternates: {
    canonical: "/cpf-life",
  },
  openGraph: {
    title: `CPF LIFE ${reference.year} Reference: Published ${reference.plan} Plan Payouts`,
    description:
      "Review CPF Board's published Standard Plan payout reference and learn how the three CPF LIFE plans differ.",
    url: `${BASE_URL}/cpf-life`,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `CPF LIFE ${reference.year} reference, SimplyCPF`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `CPF LIFE ${reference.year} Reference: Published ${reference.plan} Plan Payouts`,
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
      name: `CPF LIFE ${reference.year} Reference`,
      description: `CPF Board's published ${reference.year} ${reference.plan} Plan payout reference rows with factual descriptions of the available plan characteristics.`,
      url: `${BASE_URL}/cpf-life`,
      inLanguage: "en-SG",
      dateModified:
        CPF_POLICY_CATALOGUE.metadata["cpf-life-reference-payouts"].verifiedAt,
      isPartOf: { "@id": WEBSITE_ID },
      keywords: `CPF LIFE reference, CPF LIFE payout table ${reference.year}, Standard plan, Escalating plan, Basic plan`,
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
        `Show CPF Board's published ${reference.year} ${reference.plan} Plan reference rows`,
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
          lede={`CPF Board publishes ${reference.plan} Plan reference payouts for a ${reference.profile} member turning ${retirementAge} in ${reference.year}. Use them for context, then use CPF's personalised planner. Other plan types are described by official characteristics, not invented ratios.`}
        />
        <CpfLifeContent />
        <CpfLifeDefinitionBlock />
        <CpfRetirementSumsBlock />
      </div>
    </>
  );
}
