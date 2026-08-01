import { Accordion, Breadcrumbs, Card } from "@heroui/react";
import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, OG_IMAGE, WEBSITE_ID } from "@/config";
import { buildFaqJsonLdMainEntity, faqCalculatorData } from "@/data/cpf-faqs";

export const metadata: Metadata = {
  title: "CPF Contribution Rates FAQ",
  description:
    "Find answers to questions about CPF contribution calculations, income ceilings, age-based rates, and how contributions are distributed.",
  keywords:
    "CPF contribution rates FAQ, CPF income ceiling, CPF calculation, employee employer contributions, age group rates",
  alternates: {
    canonical: "/faq/contribution-rates",
  },
  openGraph: {
    title: "CPF Contribution Rates FAQ",
    description:
      "Find answers to questions about CPF contribution calculations, income ceilings, age-based rates, and how contributions are distributed.",
    url: `${BASE_URL}/faq/contribution-rates`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF Contribution Rates FAQ",
    description:
      "Find answers to questions about CPF contribution calculations, income ceilings, age-based rates, and how contributions are distributed.",
    images: [OG_IMAGE.url],
  },
};

const ContributionRatesFAQ = () => {
  const schema: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/faq/contribution-rates/#webpage`,
        name: "CPF Contribution Rates FAQ",
        description:
          "Find answers to questions about CPF contribution calculations, income ceilings, age-based rates, and how contributions are distributed.",
        url: `${BASE_URL}/faq/contribution-rates`,
        inLanguage: "en-SG",
        isPartOf: { "@id": WEBSITE_ID },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "[data-content-block='faq']"],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "FAQ",
            item: `${BASE_URL}/faq`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Contribution Rates",
            item: `${BASE_URL}/faq/contribution-rates`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: buildFaqJsonLdMainEntity(faqCalculatorData),
      },
    ],
  };

  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-6 p-6">
        <Breadcrumbs>
          <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
          <Breadcrumbs.Item href="/faq">FAQ</Breadcrumbs.Item>
          <Breadcrumbs.Item>Contribution Rates</Breadcrumbs.Item>
        </Breadcrumbs>

        <Card data-content-block="faq">
          <Card.Header>
            <Card.Title>CPF Contribution Rates</Card.Title>
            <Card.Description>
              Questions about CPF contribution calculations, income ceilings,
              and age-based rates
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <Accordion className="w-full" variant="surface">
              {faqCalculatorData.map(({ question, answer }) => {
                const index = `${question}-${answer}`;
                return (
                  <Accordion.Item key={index} id={`item-${index}`}>
                    <Accordion.Heading>
                      <Accordion.Trigger className="text-left">
                        {question}
                        <Accordion.Indicator />
                      </Accordion.Trigger>
                    </Accordion.Heading>
                    <Accordion.Panel>
                      <Accordion.Body>{answer}</Accordion.Body>
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </Card.Content>
        </Card>
      </div>
    </>
  );
};

export default ContributionRatesFAQ;
