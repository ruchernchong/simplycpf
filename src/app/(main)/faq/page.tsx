import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import OnThisPageNav from "@/components/faq/on-this-page-nav";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL } from "@/config";
import faqData from "@/data/faq.json";
import faqCalculatorData from "@/data/faq-calculator.json";
import faqCpfLifeData from "@/data/faq-cpf-life.json";
import faqProjectionData from "@/data/faq-projection.json";
import {
  buildBreadcrumbList,
  buildFAQPage,
  buildGraph,
  buildPageSchema,
} from "@/lib/build-schema";

export const metadata: Metadata = {
  title: "CPF FAQ — Common Questions Answered",
  description:
    "Find answers to frequently asked questions about CPF contributions, career projections, CPF LIFE, and retirement planning in Singapore.",
  keywords:
    "CPF FAQ, CPF questions, CPF answers, Singapore CPF help, CPF calculator FAQ, CPF contribution FAQ, CPF LIFE FAQ, CPF retirement planning",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "CPF FAQ — Common Questions Answered",
    description:
      "Find answers to frequently asked questions about CPF contributions, career projections, CPF LIFE, and retirement planning in Singapore.",
    url: `${BASE_URL}/faq`,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "CPF FAQ — Common Questions Answered",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF FAQ — Common Questions Answered",
    description:
      "Find answers to frequently asked questions about CPF contributions, career projections, CPF LIFE, and retirement planning in Singapore.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

interface PolicySection {
  id: string;
  title: string;
  body: string;
}

const SECTIONS: PolicySection[] = [
  {
    id: "overview",
    title: "Overview",
    body: "This page explains how CPF contribution rules work in practice and where key thresholds apply. Use it as a quick reference before using calculators or planning salary changes.",
  },
  {
    id: "contribution-ceiling",
    title: "Contribution ceiling",
    body: "From September 2026, ordinary wages are subject to CPF up to a monthly income ceiling of $8,000. Any wages above that amount are not counted for compulsory CPF contributions, though additional voluntary top-ups may still be possible under separate limits.",
  },
  {
    id: "account-allocations",
    title: "Account allocations and age 55",
    body: "Contribution shares across OA, SA, and MA vary by age band. At age 55, savings are set aside for retirement in the Retirement Account, which often affects how later contributions are allocated. Refer to age-specific rates for planning accuracy.",
  },
];

const FAQIndex = () => {
  const allFaqs = [
    ...faqData,
    ...faqCalculatorData,
    ...faqProjectionData,
    ...faqCpfLifeData,
  ];

  const schema: Graph = buildGraph([
    buildPageSchema({
      name: "CPF FAQ — Common Questions Answered",
      description:
        "Find answers to frequently asked questions about CPF contributions, career projections, CPF LIFE, and retirement planning in Singapore.",
      url: `${BASE_URL}/faq`,
    }),
    buildBreadcrumbList([
      { name: "Home", url: BASE_URL },
      { name: "FAQ", url: `${BASE_URL}/faq` },
    ]),
    buildFAQPage(allFaqs),
  ]);

  return (
    <>
      <StructuredData data={schema} />
      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
            <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.1em]">
              On this page
            </p>
            <OnThisPageNav
              items={SECTIONS.map(({ id, title }) => ({ id, title }))}
            />
          </div>
        </aside>

        <main className="flex flex-col gap-5">
          <header className="flex flex-col gap-1">
            <h1 className="font-bold text-[28px] text-foreground tracking-tight md:text-[32px]">
              CPF Policy and Help
            </h1>
            <p className="text-[12px] text-muted-foreground">
              Last updated 12 Mar 2026 · 6 min read
            </p>
          </header>

          {SECTIONS.map(({ id, title, body }) => (
            <section
              key={id}
              id={id}
              aria-label={title}
              className="flex scroll-mt-24 flex-col gap-2 rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <h2 className="font-semibold text-[18px] text-foreground">
                {title}
              </h2>
              <p className="text-[13px] text-muted-foreground leading-[1.6]">
                {body}
              </p>
            </section>
          ))}
        </main>
      </div>
    </>
  );
};

export default FAQIndex;
