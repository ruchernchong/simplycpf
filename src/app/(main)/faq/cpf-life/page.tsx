import { Accordion, Breadcrumbs, Card } from "@heroui/react";
import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, OG_IMAGE, WEBSITE_ID } from "@/config";
import faqCpfLifeData from "@/data/faq-cpf-life.json";

export const metadata: Metadata = {
  title: "CPF LIFE FAQ: Monthly Payouts & Plans",
  description:
    "Find answers to questions about CPF LIFE monthly payouts, plan types (Standard, Escalating, Basic), deferment options, and retirement sums.",
  keywords:
    "CPF LIFE FAQ, CPF LIFE payout, CPF LIFE plans, Standard Plan, Escalating Plan, Basic Plan, CPF retirement sum",
  alternates: {
    canonical: "/faq/cpf-life",
  },
  openGraph: {
    title: "CPF LIFE FAQ: Monthly Payouts & Plans",
    description:
      "Find answers to questions about CPF LIFE monthly payouts, plan types (Standard, Escalating, Basic), deferment options, and retirement sums.",
    url: `${BASE_URL}/faq/cpf-life`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF LIFE FAQ: Monthly Payouts & Plans",
    description:
      "Find answers to questions about CPF LIFE monthly payouts, plan types (Standard, Escalating, Basic), deferment options, and retirement sums.",
    images: [OG_IMAGE.url],
  },
};

const CpfLifeFAQ = () => {
  const schema: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/faq/cpf-life/#webpage`,
        name: "CPF LIFE FAQ: Monthly Payouts & Plans",
        description:
          "Find answers to questions about CPF LIFE monthly payouts, plan types (Standard, Escalating, Basic), deferment options, and retirement sums.",
        url: `${BASE_URL}/faq/cpf-life`,
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
            name: "CPF LIFE",
            item: `${BASE_URL}/faq/cpf-life`,
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
    ],
  };

  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-6 p-6">
        <Breadcrumbs>
          <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
          <Breadcrumbs.Item href="/faq">FAQ</Breadcrumbs.Item>
          <Breadcrumbs.Item>CPF LIFE</Breadcrumbs.Item>
        </Breadcrumbs>

        <Card data-content-block="faq">
          <Card.Header>
            <Card.Title>CPF LIFE</Card.Title>
            <Card.Description>
              Questions about monthly payouts, plan types, deferment options,
              and retirement sums
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <Accordion className="w-full" variant="surface">
              {faqCpfLifeData.map(({ question, answer }) => {
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

export default CpfLifeFAQ;
