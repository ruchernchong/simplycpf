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
import { BASE_URL, OG_BASE_WITHOUT_IMAGE, WEBSITE_ID } from "@/config";
import faqProjectionData from "@/data/faq-projection.json";

export const metadata: Metadata = {
  title: "CPF Projection Calculator: Project Your CPF to Age 55, 65 and 70",
  description:
    "Project your CPF balances from today to age 55, 65 or 70 using conservative CPF floor interest rates. See your projected OA, SA, MA and RA balances, CPF LIFE estimates, and the impact of housing withdrawals, top-ups and OA to SA transfers.",
  keywords:
    "CPF projection calculator, CPF projection Singapore, CPF at 55, CPF at 65, CPF retirement projection, CPF LIFE estimate, CPF OA SA MA projection",
  alternates: {
    canonical: "/projection",
  },
  openGraph: {
    ...OG_BASE_WITHOUT_IMAGE,
    description:
      "Project your CPF balances with conservative floor rates, milestone snapshots, and CPF LIFE payout estimates.",
    url: `${BASE_URL}/projection`,
  },
  /*
   * Replaces the layout's twitter block so its pinned site image does not win
   * over the opengraph-image.tsx this route generates for itself.
   */
  twitter: {
    card: "summary_large_image",
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
        "CPF projection calculator, CPF at 55, CPF at 65, CPF retirement projection, CPF LIFE estimate",
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
        "Enter your current income and birth date, adjust optional CPF assumptions, and review your projected balances and CPF LIFE estimates.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Enter your monthly income and birth date",
          text: "Add your monthly income and birth month and year so the calculator can apply the right CPF age group and contribution rates.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Adjust optional CPF assumptions",
          text: "Optionally add housing withdrawals, annual voluntary top-ups, and OA to SA transfers to model common planning decisions.",
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
          name: "Check your estimated CPF LIFE payouts",
          text: "Use your projected Retirement Account balance to estimate CPF LIFE payouts across the Standard, Escalating, Basic and deferred-to-70 options.",
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
        "Estimate CPF LIFE payouts",
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
          <Typography type="h1" weight="bold" className="mb-4 text-balance">
            Will Your CPF Be Enough for Retirement?
          </Typography>
          <Typography
            color="muted"
            data-projection-intro
            className="mx-auto max-w-3xl"
          >
            Project your CPF balances using conservative floor rates, current
            contribution rules, and key milestones like the age 55 transfer to
            your Retirement Account. You can also test how housing withdrawals,
            annual top-ups, and OA to SA transfers may change the outcome.
          </Typography>
        </div>
        <Suspense
          fallback={
            <div className="min-h-[480px] rounded-lg bg-surface-tertiary/30" />
          }
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
