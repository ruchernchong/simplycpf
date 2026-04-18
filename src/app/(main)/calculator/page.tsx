import type { Metadata } from "next";
import { createSearchParamsCache, parseAsInteger } from "nuqs/server";
import type { Graph } from "schema-dts";
import CalculatorContent from "@/components/calculator/calculator-content";
import CheatSheetCta from "@/components/lead-magnets/cheat-sheet-cta";
import CpfAgeSpecificBlock from "@/components/seo/cpf-age-specific-block";
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
import { findAgeGroup } from "@/lib/find-age-group";

const searchParamsCache = createSearchParamsCache({
  age: parseAsInteger,
});

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { age } = await searchParamsCache.parse(searchParams);

  if (!age) {
    return {
      title: "CPF Contribution Calculator | Know Your Take-Home Pay After CPF",
      description:
        "Free CPF contribution calculator for Singapore employees and employers. See exactly how much goes into your OA, SA, and MA accounts, what your employer contributes, and how the rising income ceiling changes your take-home pay.",
      keywords:
        "CPF contribution calculator, CPF calculator, CPF deduction, take-home pay calculator Singapore, CPF contribution rate by age, CPF employee employer contribution, CPF OA SA MA distribution, Singapore CPF calculator",
      alternates: {
        canonical: "/calculator",
      },
      openGraph: {
        title:
          "CPF Contribution Calculator | Know Your Take-Home Pay After CPF",
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
        title:
          "CPF Contribution Calculator | Know Your Take-Home Pay After CPF",
        description:
          "Free CPF contribution calculator. See how much goes into your OA, SA, and MA accounts, what your employer contributes, and how the rising ceiling affects your pay.",
        images: [`${BASE_URL}/opengraph-image`],
      },
    };
  }

  const ageGroup = findAgeGroup(age);
  const totalRate =
    (ageGroup.contributionRate.employee + ageGroup.contributionRate.employer) *
    100;

  return {
    title: `CPF Calculator for ${ageGroup.description} | Singapore`,
    description: `Calculate CPF contributions for employees ${ageGroup.description.toLowerCase()}. See ${totalRate}% total rate, OA/SA/MA distribution, and take-home pay impact.`,
    keywords: `CPF calculator ${ageGroup.description.toLowerCase()}, CPF contribution rate ${age}, CPF ${age} years old, Singapore CPF calculator age ${age}`,
    alternates: {
      canonical: `/calculator?age=${age}`,
    },
    openGraph: {
      title: `CPF Calculator for ${ageGroup.description} | Singapore`,
      description: `Calculate CPF contributions for employees ${ageGroup.description.toLowerCase()}. See ${totalRate}% total rate, OA/SA/MA distribution, and take-home pay impact.`,
      url: `${BASE_URL}/calculator?age=${age}`,
      images: [
        {
          url: `${BASE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `CPF Calculator for ${ageGroup.description} — SimplyCPF`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `CPF Calculator for ${ageGroup.description} | Singapore`,
      description: `Calculate CPF contributions for employees ${ageGroup.description.toLowerCase()}. See ${totalRate}% total rate, OA/SA/MA distribution, and take-home pay impact.`,
      images: [`${BASE_URL}/opengraph-image`],
    },
  };
}

const CalculatorPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { age } = await searchParamsCache.parse(searchParams);
  const ageGroup = age ? findAgeGroup(age) : null;

  const schema: Graph = buildGraph([
    buildPageSchema({
      name: ageGroup
        ? `SimplyCPF Calculator — ${ageGroup.description}`
        : "SimplyCPF Calculator",
      description:
        "Free CPF contribution calculator for Singapore employees and employers. Calculate employee and employer CPF contributions by age group, view distribution across OA, SA, and MA accounts, and track income ceiling impacts on take-home pay.",
      url: ageGroup
        ? `${BASE_URL}/calculator?age=${age}`
        : `${BASE_URL}/calculator`,
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
              Optional email only for requested resources
            </span>
          </div>
        </div>
        <CalculatorContent />
        {ageGroup && <CpfAgeSpecificBlock ageGroup={ageGroup} />}
        <IncomeCeilingDefinitionBlock />
        <CheatSheetCta compact />
      </div>
    </>
  );
};

export default CalculatorPage;
