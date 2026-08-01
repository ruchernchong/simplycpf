import { Breadcrumbs, Card, Chip } from "@heroui/react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Graph } from "schema-dts";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, OG_IMAGE, WEBSITE_ID } from "@/config";
import faqData from "@/data/faq.json";
import faqCalculatorData from "@/data/faq-calculator.json";
import faqCpfLifeData from "@/data/faq-cpf-life.json";
import faqProjectionData from "@/data/faq-projection.json";

export const metadata: Metadata = {
  title: "CPF FAQ: Common Questions Answered",
  description:
    "Find answers to frequently asked questions about CPF contributions, career projections, CPF LIFE, and retirement planning in Singapore.",
  keywords:
    "CPF FAQ, CPF questions, CPF answers, Singapore CPF help, CPF calculator FAQ, CPF contribution FAQ, CPF LIFE FAQ, CPF retirement planning",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "CPF FAQ: Common Questions Answered",
    description:
      "Find answers to frequently asked questions about CPF contributions, career projections, CPF LIFE, and retirement planning in Singapore.",
    url: `${BASE_URL}/faq`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF FAQ: Common Questions Answered",
    description:
      "Find answers to frequently asked questions about CPF contributions, career projections, CPF LIFE, and retirement planning in Singapore.",
    images: [OG_IMAGE.url],
  },
};

const FAQIndex = () => {
  // Combine all FAQ data for the schema
  const allFaqs = [
    ...faqData,
    ...faqCalculatorData,
    ...faqProjectionData,
    ...faqCpfLifeData,
  ];

  const schema: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/faq/#webpage`,
        name: "CPF FAQ: Common Questions Answered",
        description:
          "Find answers to frequently asked questions about CPF contributions, career projections, CPF LIFE, and retirement planning in Singapore.",
        url: `${BASE_URL}/faq`,
        inLanguage: "en-SG",
        isPartOf: { "@id": WEBSITE_ID },
        speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1"] },
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
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: allFaqs.map(({ question, answer }) => ({
          "@type": "Question" as const,
          name: question,
          acceptedAnswer: { "@type": "Answer" as const, text: answer },
        })),
      },
    ],
  };

  const categories = [
    {
      title: "General CPF Questions",
      description: `Essential CPF concepts, interest rates, and how SimplyCPF works (${faqData.length} questions)`,
      href: "/faq/general",
      count: faqData.length,
    },
    {
      title: "Contribution Rates",
      description: `CPF contribution calculations, income ceilings, and age-based rates (${faqCalculatorData.length} questions)`,
      href: "/faq/contribution-rates",
      count: faqCalculatorData.length,
    },
    {
      title: "Career Projection",
      description: `Long-term CPF balance projections, milestones, and interest (${faqProjectionData.length} questions)`,
      href: "/faq/projection",
      count: faqProjectionData.length,
    },
    {
      title: "CPF LIFE",
      description: `Monthly payouts, plan types, and retirement income (${faqCpfLifeData.length} questions)`,
      href: "/faq/cpf-life",
      count: faqCpfLifeData.length,
    },
  ];

  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-6 p-6">
        <Breadcrumbs>
          <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
          <Breadcrumbs.Item>FAQ</Breadcrumbs.Item>
        </Breadcrumbs>

        <Card>
          <Card.Header>
            <Card.Title>CPF FAQ</Card.Title>
            <Card.Description>
              Common questions answered about CPF contributions, projections,
              CPF LIFE, and retirement planning in Singapore
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="grid gap-4 sm:grid-cols-2">
              {categories.map((category) => (
                <Link
                  key={category.href}
                  href={
                    category.href as
                      | "/faq/general"
                      | "/faq/contribution-rates"
                      | "/faq/projection"
                      | "/faq/cpf-life"
                  }
                  className="group"
                >
                  <Card className="h-full transition-colors hover:border-accent">
                    <Card.Header>
                      <Card.Title className="flex items-center justify-between">
                        {category.title}
                        <Chip color="accent" size="sm" variant="soft">
                          <Chip.Label>{category.count}</Chip.Label>
                        </Chip>
                      </Card.Title>
                      <Card.Description>
                        {category.description}
                      </Card.Description>
                    </Card.Header>
                  </Card>
                </Link>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>
    </>
  );
};

export default FAQIndex;
