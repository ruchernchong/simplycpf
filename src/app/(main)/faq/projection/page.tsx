import { Accordion, Breadcrumbs, Card } from "@heroui/react";
import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, OG_IMAGE, WEBSITE_ID } from "@/config";
import { buildFaqJsonLdMainEntity, faqProjectionData } from "@/data/cpf-faqs";
import { CPF_POLICY_CATALOGUE } from "@/policy";

const retirementAge =
  CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;
const payoutAge =
  CPF_POLICY_CATALOGUE.rules.lifecycleAges.cpfLifePayoutEligibility;

export const metadata: Metadata = {
  title: "CPF Career Projection FAQ",
  description:
    "Find answers about monthly CPF balance projections, age milestones, policy assumptions, interest calculations, and CPF LIFE references.",
  keywords: `CPF projection FAQ, CPF balance projection, age ${retirementAge} CPF, age ${payoutAge} CPF, CPF interest calculation, CPF LIFE reference`,
  alternates: {
    canonical: "/faq/projection",
  },
  openGraph: {
    title: "CPF Career Projection FAQ",
    description:
      "Find answers about monthly CPF balance projections, age milestones, policy assumptions, interest calculations, and CPF LIFE references.",
    url: `${BASE_URL}/faq/projection`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF Career Projection FAQ",
    description:
      "Find answers about monthly CPF balance projections, age milestones, policy assumptions, interest calculations, and CPF LIFE references.",
    images: [OG_IMAGE.url],
  },
};

export default function ProjectionFAQ() {
  const schema: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/faq/projection/#webpage`,
        name: "CPF Career Projection FAQ",
        description:
          "Find answers about monthly CPF balance projections, age milestones, policy assumptions, interest calculations, and CPF LIFE references.",
        url: `${BASE_URL}/faq/projection`,
        inLanguage: "en-SG",
        dateModified:
          CPF_POLICY_CATALOGUE.metadata["cpf-interest-rates"].verifiedAt,
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
        mainEntity: buildFaqJsonLdMainEntity(faqProjectionData),
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
              Questions about monthly balance projections, milestones, policy
              assumptions, and CPF LIFE references
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
}
