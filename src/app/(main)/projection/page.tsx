import { Typography } from "@heroui/react";
import type { Metadata } from "next";
import { Suspense } from "react";
import type { Graph } from "schema-dts";
import ProjectionContent from "@/components/projection/projection-content";
import CpfInterestTiersBlock from "@/components/seo/cpf-interest-tiers-block";
import CpfProjectionIntroBlock from "@/components/seo/cpf-projection-intro-block";
import CpfRetirementSumsBlock from "@/components/seo/cpf-retirement-sums-block";
import CpfTopUpLimitsBlock from "@/components/seo/cpf-top-up-limits-block";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, WEBSITE_ID } from "@/config";
import faqProjectionData from "@/data/faq-projection.json";

export const metadata: Metadata = {
  title: "CPF Projection Calculator: Project Your CPF to Age 55, 65 and 70",
  description:
    "Project supplied OA, SA, MA and RA balances month by month using CPF floor interest rates, published contribution schedules, and clearly marked assumptions for unpublished future policy.",
  keywords:
    "CPF projection calculator, CPF projection Singapore, CPF at 55, CPF at 65, CPF retirement projection, CPF OA SA MA RA projection",
  alternates: {
    canonical: "/projection",
  },
  openGraph: {
    title: "CPF Projection Calculator: Project Your CPF to Age 55, 65 and 70",
    description:
      "Project your CPF balances month by month with floor rates, milestone snapshots, and per-year policy status.",
    url: `${BASE_URL}/projection`,
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF Projection Calculator: Project Your CPF to Age 55, 65 and 70",
    description:
      "Project your CPF balances month by month with floor rates, milestone snapshots, and per-year policy status.",
  },
};

const schema: Graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/projection/#webpage`,
      name: "CPF Projection Calculator",
      description:
        "Project your CPF balances to age 55, 65 or 70 using CPF floor rates, age-based contribution rates, and retirement account rules.",
      url: `${BASE_URL}/projection`,
      inLanguage: "en-SG",
      isPartOf: { "@id": WEBSITE_ID },
      keywords:
        "CPF projection calculator, CPF at 55, CPF at 65, CPF retirement projection",
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "[data-projection-intro]"],
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Projection",
          item: `${BASE_URL}/projection`,
        },
      ],
    },
    {
      "@type": "HowTo",
      name: "How to project your CPF balances",
      description:
        "Enter your current balances, income and birth date, adjust optional assumptions, and review projected balances with policy provenance.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Enter your balances, monthly income and birth date",
          text: "Add your current OA, SA, MA and RA balances, monthly income, and birth month and year so the calculator starts from your actual position and applies the right contribution schedule.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Adjust optional CPF assumptions",
          text: "Optionally add housing withdrawals, voluntary top-ups, and age-aware OA retirement transfers to model common planning decisions.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Review milestone balances",
          text: "See how your CPF balances may look at age 55, age 65 and age 70, including the effect of the age 55 SA to RA transfer.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Review policy status and CPF LIFE references",
          text: "Check which projected years use published CPF policy and which freeze the last published value, then compare milestone balances with CPF Board's published CPF LIFE reference rows.",
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
    {
      "@type": "SoftwareApplication",
      name: "SimplyCPF Projection Calculator",
      url: `${BASE_URL}/projection`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "SGD" },
      featureList: [
        "Project CPF balances by age",
        "Model housing withdrawals and top-ups",
        "See age 55, 65 and 70 milestone balances",
        "Show published versus assumed policy years",
      ],
    },
  ],
};

export default function ProjectionPage() {
  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <Typography align="center" className="mb-4" type="h1">
            Will Your CPF Be Enough for Retirement?
          </Typography>
          <Typography
            align="center"
            color="muted"
            data-projection-intro
            className="mx-auto max-w-3xl"
          >
            Project your CPF balances using conservative floor rates, current
            published contribution rules, and key milestones like the age 55
            transfer to your Retirement Account. Unpublished future policy is
            held constant and labelled, so the output stays a transparent
            planning scenario rather than a forecast.
          </Typography>
        </div>
        <Suspense
          fallback={<div className="min-h-[480px] rounded-lg bg-muted/30" />}
        >
          <ProjectionContent />
        </Suspense>
        <CpfProjectionIntroBlock />
        <CpfInterestTiersBlock />
        <CpfRetirementSumsBlock />
        <CpfTopUpLimitsBlock />
      </div>
    </>
  );
}
