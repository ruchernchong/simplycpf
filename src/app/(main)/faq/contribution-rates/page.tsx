import type { Metadata } from "next";
import Link from "next/link";
import type { Graph } from "schema-dts";
import { StructuredData } from "@/components/seo/structured-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BASE_URL } from "@/config";
import faqCalculatorData from "@/data/faq-calculator.json";
import {
  buildBreadcrumbList,
  buildFAQPage,
  buildGraph,
  buildPageSchema,
} from "@/lib/build-schema";

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
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "CPF Contribution Rates FAQ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF Contribution Rates FAQ",
    description:
      "Find answers to questions about CPF contribution calculations, income ceilings, age-based rates, and how contributions are distributed.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

const ContributionRatesFAQ = () => {
  const schema: Graph = buildGraph([
    buildPageSchema({
      name: "CPF Contribution Rates FAQ",
      description:
        "Find answers to questions about CPF contribution calculations, income ceilings, age-based rates, and how contributions are distributed.",
      url: `${BASE_URL}/faq/contribution-rates`,
      speakableSelectors: ["h1", "[data-content-block='faq']"],
    }),
    buildBreadcrumbList([
      { name: "Home", url: BASE_URL },
      { name: "FAQ", url: `${BASE_URL}/faq` },
      { name: "Contribution Rates", url: `${BASE_URL}/faq/contribution-rates` },
    ]),
    buildFAQPage(faqCalculatorData),
  ]);

  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/faq" />}>FAQ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Contribution Rates</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="flex flex-col gap-2">
          <h1 className="font-bold text-[28px] text-foreground tracking-tight md:text-[32px]">
            CPF Contribution Rates
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Questions about CPF contribution calculations, income ceilings, and
            age-based rates
          </p>
        </header>

        <section
          data-content-block="faq"
          itemScope
          itemProp="mainEntity"
          itemType="https://schema.org/FAQPage"
          className="flex flex-col rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <Accordion className="w-full">
            {faqCalculatorData.map(({ question, answer }) => {
              const index = `${question}-${answer}`;
              return (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <AccordionTrigger className="text-left">
                    <span itemProp="name">{question}</span>
                  </AccordionTrigger>
                  <AccordionContent
                    className="text-muted-foreground"
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <span itemProp="text">{answer}</span>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </section>
      </div>
    </>
  );
};

export default ContributionRatesFAQ;
