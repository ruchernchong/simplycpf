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
import { faqProjectionData } from "@/data/cpf-faqs";
import { CPF_POLICY_CATALOGUE } from "@/policy";

const lifecycle = CPF_POLICY_CATALOGUE.rules.lifecycleAges;
const milestoneAges = [
  lifecycle.retirementAccountCreated,
  lifecycle.cpfLifePayoutEligibility,
  lifecycle.latestCpfLifePayoutStart,
];
const milestoneLabel = milestoneAges.join(", ");
const latestInterestDeclaration =
  CPF_POLICY_CATALOGUE.quarterlyInterestRates.at(-1)?.quarter ??
  "the latest published quarter";
const projectionRateDescription = `CPF Board's published quarterly rates through ${latestInterestDeclaration}, then official floor-rate presets as an explicit assumption`;

export const metadata: Metadata = {
  title: `CPF Projection Calculator: Project Your CPF to Ages ${milestoneLabel}`,
  description: `Project supplied opening-of-start-month OA, SA, MA and RA balances month by month using ${projectionRateDescription}, published contribution schedules, and clearly marked assumptions for unpublished future policy.`,
  keywords: `CPF projection calculator, CPF projection Singapore, CPF at ${lifecycle.retirementAccountCreated}, CPF at ${lifecycle.cpfLifePayoutEligibility}, CPF retirement projection, CPF OA SA MA RA projection`,
  alternates: {
    canonical: "/projection",
  },
  openGraph: {
    title: `CPF Projection Calculator: Project Your CPF to Ages ${milestoneLabel}`,
    description: `Project opening-of-start-month CPF balances using ${projectionRateDescription}, milestone snapshots, and per-year policy status.`,
    url: `${BASE_URL}/projection`,
  },
  twitter: {
    card: "summary_large_image",
    title: `CPF Projection Calculator: Project Your CPF to Ages ${milestoneLabel}`,
    description: `Project opening-of-start-month CPF balances using ${projectionRateDescription}, milestone snapshots, and per-year policy status.`,
  },
};

const schema: Graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/projection/#webpage`,
      name: "CPF Projection Calculator",
      description: `Project your opening-of-start-month CPF balances to ages ${milestoneLabel} using ${projectionRateDescription}, age-based contribution rates, and retirement account rules.`,
      url: `${BASE_URL}/projection`,
      inLanguage: "en-SG",
      isPartOf: { "@id": WEBSITE_ID },
      keywords: `CPF projection calculator, CPF at ${lifecycle.retirementAccountCreated}, CPF at ${lifecycle.cpfLifePayoutEligibility}, CPF retirement projection`,
      dateModified:
        CPF_POLICY_CATALOGUE.metadata["cpf-interest-rates"].verifiedAt,
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
        "Enter balances at the opening of your selected start month, income and birth date, adjust optional assumptions, and review projected balances with policy provenance.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Enter opening balances, monthly income and birth date",
          text: "Add the OA, SA, MA and RA balances at the opening of your selected start month, before that month's transactions, plus monthly income and birth month and year.",
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
          text: `See milestone balances at ages ${milestoneLabel}, including the SA-to-RA transfer from age ${lifecycle.retirementAccountCreated}.`,
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
        `See age ${milestoneLabel} milestone balances`,
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
            Project your CPF balances using published quarterly declarations,
            then official floor rates as an explicit assumption after the last
            declaration, together with published contribution rules and key
            milestones like the age {lifecycle.retirementAccountCreated}{" "}
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
