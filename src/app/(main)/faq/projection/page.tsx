import { Accordion, Breadcrumbs, Card } from "@heroui/react";
import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, OG_IMAGE, WEBSITE_ID } from "@/config";
import faqProjectionData from "@/data/faq-projection.json";

export const metadata: Metadata = {
  title: "CPF Career Projection FAQ",
  description:
    "Find answers to questions about long-term CPF balance projections, age milestones, interest calculations, and CPF LIFE estimates.",
  keywords:
    "CPF projection FAQ, CPF balance projection, age 55 CPF, age 65 CPF, CPF interest calculation, CPF LIFE estimate",
  alternates: {
    canonical: "/faq/projection",
  },
  openGraph: {
    title: "CPF Career Projection FAQ",
    description:
      "Find answers to questions about long-term CPF balance projections, age milestones, interest calculations, and CPF LIFE estimates.",
    url: `${BASE_URL}/faq/projection`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF Career Projection FAQ",
    description:
      "Find answers to questions about long-term CPF balance projections, age milestones, interest calculations, and CPF LIFE estimates.",
    images: [OG_IMAGE.url],
  },
};

const ProjectionFAQ = () => {
  const schema: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/faq/projection/#webpage`,
        name: "CPF Career Projection FAQ",
        description:
          "Find answers to questions about long-term CPF balance projections, age milestones, interest calculations, and CPF LIFE estimates.",
        url: `${BASE_URL}/faq/projection`,
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
            name: "Projection",
            item: `${BASE_URL}/faq/projection`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqProjectionData.map(({ question, answer }) => ({
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
          <Breadcrumbs.Item>Projection</Breadcrumbs.Item>
        </Breadcrumbs>

        <Card data-content-block="faq">
          <Card.Header>
            <Card.Title>CPF Career Projection</Card.Title>
            <Card.Description>
              Questions about long-term balance projections, milestones, and CPF
              LIFE estimates
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <Accordion className="w-full" variant="surface">
              {faqProjectionData.map(({ question, answer }) => {
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

export default ProjectionFAQ;
