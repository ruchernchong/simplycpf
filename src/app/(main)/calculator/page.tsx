import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import CalculatorContent from "@/components/calculator/calculator-content";
import IncomeCeilingDefinitionBlock from "@/components/seo/income-ceiling-definition-block";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL } from "@/config";
import faqCalculatorData from "@/data/faq-calculator.json";
import {
  buildBreadcrumbList,
  buildFAQPage,
  buildGraph,
  buildHowTo,
  buildPageSchema,
  buildWebApplication,
} from "@/lib/build-schema";

export const metadata: Metadata = {
  title: "CPF Contribution Calculator | Know Your Take-Home Pay After CPF",
  description:
    "Free CPF contribution calculator for Singapore employees and employers. See exactly how much goes into your OA, SA, and MA accounts, what your employer contributes, and how the rising income ceiling changes your take-home pay.",
  keywords:
    "CPF contribution calculator, CPF calculator, CPF deduction, take-home pay calculator Singapore, CPF contribution rate by age, CPF employee employer contribution, CPF OA SA MA distribution, Singapore CPF calculator",
  alternates: {
    canonical: "/calculator",
  },
  openGraph: {
    title: "CPF Contribution Calculator | Know Your Take-Home Pay After CPF",
    description:
      "Free CPF contribution calculator. See how much goes into your OA, SA, and MA accounts, what your employer contributes, and how the rising ceiling affects your pay.",
    url: `${BASE_URL}/calculator`,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "CPF Contribution Calculator — SimplyCPF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF Contribution Calculator | Know Your Take-Home Pay After CPF",
    description:
      "Free CPF contribution calculator. See how much goes into your OA, SA, and MA accounts, what your employer contributes, and how the rising ceiling affects your pay.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

const CalculatorPage = () => {
  const schema: Graph = buildGraph([
    buildPageSchema({
      name: "SimplyCPF Calculator",
      description:
        "Free CPF contribution calculator for Singapore employees and employers. Calculate employee and employer CPF contributions by age group, view distribution across OA, SA, and MA accounts, and track income ceiling impacts on take-home pay.",
      url: `${BASE_URL}/calculator`,
      speakableSelectors: ["h1", ".calculator-results"],
      keywords:
        "CPF contribution calculator, CPF calculator, CPF deduction, take-home pay calculator Singapore, CPF contribution rate by age",
    }),
    buildBreadcrumbList([
      { name: "Home", url: BASE_URL },
      { name: "Calculator", url: `${BASE_URL}/calculator` },
    ]),
    buildHowTo(
      "How to calculate your CPF contributions",
      "Follow these steps to calculate your CPF employee and employer contributions, view distribution across OA, SA, and MA accounts, and understand how income ceiling changes affect your take-home pay.",
      [
        {
          name: "Enter your monthly income",
          text: "Enter your monthly gross income in Singapore dollars. CPF contributions are calculated based on your total monthly wages subject to CPF.",
        },
        {
          name: "Select your birth date to determine age group",
          text: "Select your date of birth. Your age group determines your contribution rates — there are 8 age brackets with varying employee and employer contribution percentages.",
        },
        {
          name: "Choose the income ceiling period",
          text: "Select the relevant income ceiling period. The ceiling is rising progressively from $6,000 to $8,000 between September 2023 and September 2026 following Budget 2023.",
        },
        {
          name: "View your CPF contribution breakdown",
          text: "Review your results showing employee and employer contribution amounts, distribution across OA, SA, and MA accounts, and the impact on your take-home pay.",
        },
      ],
    ),
    buildFAQPage(faqCalculatorData),
    buildWebApplication({
      name: "SimplyCPF Calculator",
      url: `${BASE_URL}/calculator`,
      featureList: [
        "Calculate CPF contributions by age group and income",
        "View distribution across OA, SA, MA accounts",
        "Track progressive income ceiling changes from 2023 to 2026",
      ],
    }),
  ]);

  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-3xl text-foreground tracking-tight md:text-4xl">
            How Much of Your Pay Goes to CPF?
          </h1>
          <p className="mx-auto mb-4 max-w-2xl text-muted-foreground">
            Enter your monthly income and age to see your full CPF breakdown —
            employee and employer contributions, distribution across your OA,
            SA, and MA, and how the progressive income ceiling changes affect
            your take-home pay.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground text-sm">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block size-1.5 rounded-full bg-accent"
                aria-hidden="true"
              />{" "}
              Free — no sign-up
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block size-1.5 rounded-full bg-accent"
                aria-hidden="true"
              />{" "}
              Results update instantly
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block size-1.5 rounded-full bg-accent"
                aria-hidden="true"
              />{" "}
              No data collected
            </span>
          </div>
        </div>
        <CalculatorContent />
        <IncomeCeilingDefinitionBlock />
      </div>
    </>
  );
};

export default CalculatorPage;
