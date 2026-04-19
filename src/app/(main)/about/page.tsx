import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import { StructuredData } from "@/components/seo/structured-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BASE_URL } from "@/config";
import faqData from "@/data/faq.json";
import {
  buildBreadcrumbList,
  buildFAQPage,
  buildGraph,
  buildPageSchema,
  buildSpeakable,
} from "@/lib/build-schema";

export const metadata: Metadata = {
  title: "About SimplyCPF | Free Singapore CPF Contribution Calculator",
  description:
    "About SimplyCPF — a free, open-source CPF contribution calculator for Singapore employees and employers. Learn how SimplyCPF calculates CPF contributions by age group, tracks income ceiling changes, and helps you plan your retirement savings.",
  keywords:
    "About SimplyCPF, CPF calculator Singapore, CPF contribution accuracy, CPF age groups, CPF income ceiling, Singapore CPF contribution rates, how CPF is calculated, CPF FAQ",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About SimplyCPF | Free Singapore CPF Contribution Calculator",
    description:
      "Learn about SimplyCPF — the free, open-source CPF contribution calculator for Singapore employees and employers.",
    url: `${BASE_URL}/about`,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "About SimplyCPF — Free CPF Contribution Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About SimplyCPF | Free Singapore CPF Contribution Calculator",
    description:
      "Learn about SimplyCPF — the free, open-source CPF contribution calculator for Singapore employees and employers.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

interface AboutSection {
  title: string;
  body: string;
}

const SECTIONS: AboutSection[] = [
  {
    title: "Purpose",
    body: "SimplyCPF is a free, open-source CPF planning tool for Singapore Citizens and Permanent Residents. It helps users estimate CPF contributions and projected outcomes based on income, age group, and prevailing contribution rules.",
  },
  {
    title: "Scope of Service",
    body: "CPF contribution rates vary across age groups, and allocations across Ordinary Account (OA), Special Account (SA), and MediSave Account (MA) differ by profile. This page summarises those mechanics in a practical, readable format.",
  },
  {
    title: "Source and Accuracy",
    body: "Calculation references are based on publicly available CPF Board guidance and are updated when official rules change. Users should verify final decisions against official CPF resources.",
  },
];

const About = () => {
  const schema: Graph = buildGraph([
    buildPageSchema({
      name: "About SimplyCPF",
      description:
        "About SimplyCPF — a free, open-source CPF contribution calculator for Singapore employees and employers, with frequently asked questions about CPF contributions, income ceiling changes, and account distributions.",
      url: `${BASE_URL}/about`,
      speakableSelectors: ["h1", "[data-content-block='faq']"],
    }),
    buildBreadcrumbList([
      { name: "Home", url: BASE_URL },
      { name: "About", url: `${BASE_URL}/about` },
    ]),
    buildFAQPage(faqData),
    buildSpeakable(["h1", "[data-content-block='faq']"]),
  ]);

  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-5">
        <section
          aria-label="About SimplyCPF"
          className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex flex-col gap-1">
            <h1 className="font-bold text-[24px] text-foreground tracking-tight">
              About SimplyCPF
            </h1>
            <p className="text-[13px] text-muted-foreground">
              Independent informational resource for CPF contribution planning.
            </p>
          </div>
          <ol className="flex flex-col gap-4">
            {SECTIONS.map(({ title, body }, index) => (
              <li key={title} className="flex flex-col gap-1">
                <h2 className="font-semibold text-[14px] text-foreground">
                  {index + 1}. {title}
                </h2>
                <p className="text-[13px] text-muted-foreground leading-[1.55]">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-label="Disclaimer"
          className="flex flex-col gap-2 rounded-lg bg-primary p-5 text-primary-foreground"
        >
          <h2 className="font-semibold text-[14px]">Disclaimer</h2>
          <p className="text-[13px] leading-[1.55] opacity-80">
            SimplyCPF provides estimates based on publicly available CPF
            contribution rates and income ceilings. Always refer to the official
            CPF Board for authoritative information and seek professional
            financial advice for your specific situation.
          </p>
        </section>

        <section
          data-content-block="faq"
          aria-label="Frequently asked questions"
          className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
          itemScope
          itemProp="mainEntity"
          itemType="https://schema.org/FAQPage"
        >
          <h2 className="font-semibold text-[16px] text-foreground">
            Frequently Asked Questions
          </h2>
          <Accordion className="w-full">
            {faqData.map(({ question, answer }) => {
              const index = `${question}-${answer}`;
              return (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <AccordionTrigger className="text-left text-[14px]">
                    <span itemProp="name">{question}</span>
                  </AccordionTrigger>
                  <AccordionContent
                    className="text-[13px] text-muted-foreground leading-[1.55]"
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

export default About;
