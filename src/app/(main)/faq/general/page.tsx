import { Accordion, Breadcrumbs, Card } from "@heroui/react";
import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, OG_IMAGE, WEBSITE_ID } from "@/config";
import faqData from "@/data/faq.json";

export const metadata: Metadata = {
  title: "General CPF FAQ",
  description:
    "Find answers to general CPF questions about interest rates, account types, data privacy, and how SimplyCPF works.",
  keywords:
    "CPF general FAQ, CPF interest rates, OA SA MA, CPF data privacy, SimplyCPF questions",
  alternates: {
    canonical: "/faq/general",
  },
  openGraph: {
    title: "General CPF FAQ",
    description:
      "Find answers to general CPF questions about interest rates, account types, data privacy, and how SimplyCPF works.",
    url: `${BASE_URL}/faq/general`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "General CPF FAQ",
    description:
      "Find answers to general CPF questions about interest rates, account types, data privacy, and how SimplyCPF works.",
    images: [OG_IMAGE.url],
  },
};

const GeneralFAQ = () => {
  const schema: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/faq/general/#webpage`,
        name: "General CPF FAQ",
        description:
          "Find answers to general CPF questions about interest rates, account types, data privacy, and how SimplyCPF works.",
        url: `${BASE_URL}/faq/general`,
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
            name: "General",
            item: `${BASE_URL}/faq/general`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqData.map(({ question, answer }) => ({
          "@type": "Question" as const,
          name: question,
          acceptedAnswer: { "@type": "Answer" as const, text: answer },
        })),
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
          <Breadcrumbs.Item>General</Breadcrumbs.Item>
        </Breadcrumbs>

        <Card data-content-block="faq">
          <Card.Header>
            <Card.Title>General CPF Questions</Card.Title>
            <Card.Description>
              Essential CPF concepts, interest rates, account types, and how
              SimplyCPF works
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <Accordion className="w-full" variant="surface">
              {faqData.map(({ question, answer }) => {
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

export default GeneralFAQ;
