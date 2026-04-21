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
import faqProjectionData from "@/data/faq-projection.json";
import {
  buildBreadcrumbList,
  buildFAQPage,
  buildGraph,
  buildPageSchema,
} from "@/lib/build-schema";

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
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "CPF Career Projection FAQ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF Career Projection FAQ",
    description:
      "Find answers to questions about long-term CPF balance projections, age milestones, interest calculations, and CPF LIFE estimates.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

const ProjectionFAQ = () => {
  const schema: Graph = buildGraph([
    buildPageSchema({
      name: "CPF Career Projection FAQ",
      description:
        "Find answers to questions about long-term CPF balance projections, age milestones, interest calculations, and CPF LIFE estimates.",
      url: `${BASE_URL}/faq/projection`,
      speakableSelectors: ["h1", "[data-content-block='faq']"],
    }),
    buildBreadcrumbList([
      { name: "Home", url: BASE_URL },
      { name: "FAQ", url: `${BASE_URL}/faq` },
      { name: "Projection", url: `${BASE_URL}/faq/projection` },
    ]),
    buildFAQPage(faqProjectionData),
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
              <BreadcrumbPage>Projection</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="flex flex-col gap-2">
          <h1 className="font-bold text-[28px] text-foreground tracking-tight md:text-[32px]">
            CPF Career Projection
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Long-term CPF balance projections, milestones, and CPF LIFE
            estimates
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
            {faqProjectionData.map(({ question, answer }) => {
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

export default ProjectionFAQ;
