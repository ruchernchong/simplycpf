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
import faqCpfLifeData from "@/data/faq-cpf-life.json";
import {
  buildBreadcrumbList,
  buildFAQPage,
  buildGraph,
  buildPageSchema,
} from "@/lib/build-schema";

export const metadata: Metadata = {
  title: "CPF LIFE FAQ — Monthly Payouts & Plans",
  description:
    "Find answers to questions about CPF LIFE monthly payouts, plan types (Standard, Escalating, Basic), deferment options, and retirement sums.",
  keywords:
    "CPF LIFE FAQ, CPF LIFE payout, CPF LIFE plans, Standard Plan, Escalating Plan, Basic Plan, CPF retirement sum",
  alternates: {
    canonical: "/faq/cpf-life",
  },
  openGraph: {
    title: "CPF LIFE FAQ — Monthly Payouts & Plans",
    description:
      "Find answers to questions about CPF LIFE monthly payouts, plan types (Standard, Escalating, Basic), deferment options, and retirement sums.",
    url: `${BASE_URL}/faq/cpf-life`,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "CPF LIFE FAQ — Monthly Payouts & Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF LIFE FAQ — Monthly Payouts & Plans",
    description:
      "Find answers to questions about CPF LIFE monthly payouts, plan types (Standard, Escalating, Basic), deferment options, and retirement sums.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

const CpfLifeFAQ = () => {
  const schema: Graph = buildGraph([
    buildPageSchema({
      name: "CPF LIFE FAQ — Monthly Payouts & Plans",
      description:
        "Find answers to questions about CPF LIFE monthly payouts, plan types (Standard, Escalating, Basic), deferment options, and retirement sums.",
      url: `${BASE_URL}/faq/cpf-life`,
      speakableSelectors: ["h1", "[data-content-block='faq']"],
    }),
    buildBreadcrumbList([
      { name: "Home", url: BASE_URL },
      { name: "FAQ", url: `${BASE_URL}/faq` },
      { name: "CPF LIFE", url: `${BASE_URL}/faq/cpf-life` },
    ]),
    buildFAQPage(faqCpfLifeData),
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
              <BreadcrumbPage>CPF LIFE</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="flex flex-col gap-2">
          <h1 className="font-bold text-[28px] text-foreground tracking-tight md:text-[32px]">
            CPF LIFE
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Monthly payouts, plan types, deferment options, and retirement sums
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
            {faqCpfLifeData.map(({ question, answer }) => {
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

export default CpfLifeFAQ;
