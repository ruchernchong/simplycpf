import type { Metadata } from "next";
import { Suspense } from "react";
import ProjectionContent from "@/components/projection/projection-content";
import CpfInterestTiersBlock from "@/components/seo/cpf-interest-tiers-block";
import CpfProjectionIntroBlock from "@/components/seo/cpf-projection-intro-block";
import CpfRetirementSumsBlock from "@/components/seo/cpf-retirement-sums-block";
import CpfTopUpLimitsBlock from "@/components/seo/cpf-top-up-limits-block";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL } from "@/config";
import faqProjectionData from "@/data/faq-projection.json";
import {
  buildFAQPage,
  buildGraph,
  buildHowTo,
  buildPageSchema,
  buildWebApplication,
  pageBreadcrumb,
} from "@/lib/build-schema";

export const metadata: Metadata = {
  title: "CPF Projection Calculator | Project Your CPF to Age 55, 65 and 70",
  description:
    "Project your CPF balances from today to age 55, 65 or 70 using conservative CPF floor interest rates. See your projected OA, SA, MA and RA balances, CPF LIFE estimates, and the impact of housing withdrawals, top-ups and OA to SA transfers.",
  keywords:
    "CPF projection calculator, CPF projection Singapore, CPF at 55, CPF at 65, CPF retirement projection, CPF LIFE estimate, CPF OA SA MA projection",
  alternates: {
    canonical: "/projection",
  },
  openGraph: {
    title: "CPF Projection Calculator | Project Your CPF to Age 55, 65 and 70",
    description:
      "Project your CPF balances with conservative floor rates, milestone snapshots, and CPF LIFE payout estimates.",
    url: `${BASE_URL}/projection`,
    images: [
      {
        url: `${BASE_URL}/projection/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "CPF Projection Calculator - SimplyCPF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF Projection Calculator | Project Your CPF to Age 55, 65 and 70",
    description:
      "Project your CPF balances with conservative floor rates, milestone snapshots, and CPF LIFE payout estimates.",
    images: [`${BASE_URL}/projection/opengraph-image`],
  },
};

const schema = buildGraph([
  buildPageSchema({
    name: "CPF Projection Calculator",
    description:
      "Project your CPF balances to age 55, 65 or 70 using CPF floor rates, age-based contribution rates, and retirement account rules.",
    url: `${BASE_URL}/projection`,
    speakableSelectors: ["h1", "[data-projection-intro]"],
    keywords:
      "CPF projection calculator, CPF at 55, CPF at 65, CPF retirement projection, CPF LIFE estimate",
  }),
  pageBreadcrumb("Projection", `${BASE_URL}/projection`),
  buildHowTo(
    "How to project your CPF balances",
    "Enter your current income and birth date, adjust optional CPF assumptions, and review your projected balances and CPF LIFE estimates.",
    [
      {
        name: "Enter your monthly income and birth date",
        text: "Add your monthly income and birth month and year so the calculator can apply the right CPF age group and contribution rates.",
      },
      {
        name: "Adjust optional CPF assumptions",
        text: "Optionally add housing withdrawals, annual voluntary top-ups, and OA to SA transfers to model common planning decisions.",
      },
      {
        name: "Review milestone balances",
        text: "See how your CPF balances may look at age 55, age 65 and age 70, including the effect of the age 55 SA to RA transfer.",
      },
      {
        name: "Check your estimated CPF LIFE payouts",
        text: "Use your projected Retirement Account balance to estimate CPF LIFE payouts across the Standard, Escalating, Basic and deferred-to-70 options.",
      },
    ],
  ),
  buildFAQPage(faqProjectionData),
  buildWebApplication({
    name: "SimplyCPF Projection Calculator",
    url: `${BASE_URL}/projection`,
    featureList: [
      "Project CPF balances by age",
      "Model housing withdrawals and top-ups",
      "See age 55, 65 and 70 milestone balances",
      "Estimate CPF LIFE payouts",
    ],
  }),
]);

export default function ProjectionPage() {
  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-3xl text-foreground tracking-tight md:text-4xl">
            Will Your CPF Be Enough for Retirement?
          </h1>
          <p
            data-projection-intro
            className="mx-auto max-w-3xl text-muted-foreground"
          >
            Project your CPF balances using conservative floor rates, current
            contribution rules, and key milestones like the age 55 transfer to
            your Retirement Account. You can also test how housing withdrawals,
            annual top-ups, and OA to SA transfers may change the outcome.
          </p>
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
