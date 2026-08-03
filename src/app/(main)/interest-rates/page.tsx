import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import { AllocationByAge } from "@/components/interest-rates/allocation-by-age";
import { ContributionRatesTable } from "@/components/interest-rates/contribution-rates-table";
import { QuarterlyRatesTable } from "@/components/interest-rates/quarterly-rates-table";
import { RateTiles } from "@/components/interest-rates/rate-tiles";
import CpfContributionComparisonBlock from "@/components/seo/cpf-contribution-comparison-block";
import CpfDistributionComparisonBlock from "@/components/seo/cpf-distribution-comparison-block";
import CpfInterestTiersBlock from "@/components/seo/cpf-interest-tiers-block";
import { StructuredData } from "@/components/seo/structured-data";
import { PageHeader } from "@/components/shared/section-header";
import { BASE_URL } from "@/config";
import {
  buildBreadcrumbList,
  buildDataset,
  buildGraph,
  buildPageSchema,
  buildSpeakable,
} from "@/lib/build-schema";

export const metadata: Metadata = {
  title: "CPF Interest Rates | How Much Does Your OA, SA & MA Earn?",
  description:
    "See current CPF interest rates for your Ordinary, Special, and MediSave accounts. Understand the guaranteed floor rates, how SMRA rates are pegged, and view contribution distribution rates across all 8 age brackets.",
  keywords:
    "CPF interest rates, OA interest rate, SA interest rate, MA interest rate, CPF floor rate, CPF pegged rate, SGS yield, CPF distribution rates, CPF contribution distribution by age, Singapore CPF rates, SMRA interest rate",
  alternates: {
    canonical: "/interest-rates",
  },
  openGraph: {
    title: "CPF Interest Rates | How Much Does Your OA, SA & MA Earn?",
    description:
      "See current CPF interest rates for OA, SA, and MA. Understand guaranteed floor rates, SMRA pegged rates, and view distribution rates by age group.",
    url: `${BASE_URL}/interest-rates`,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "CPF Interest Rates — SimplyCPF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF Interest Rates | How Much Does Your OA, SA & MA Earn?",
    description:
      "See current CPF interest rates for OA, SA, and MA. Understand guaranteed floor rates, SMRA pegged rates, and view distribution rates by age group.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

export default function InterestRatesPage() {
  const schema: Graph = buildGraph([
    buildPageSchema({
      name: "CPF Interest Rates",
      description:
        "View current CPF interest rates for OA, SA, and MA accounts. Understand floor rates vs pegged rates, see historical trends, and learn contribution distribution rates by age group.",
      url: `${BASE_URL}/interest-rates`,
      speakableSelectors: ["h1", ".interest-rates-description"],
      keywords:
        "CPF interest rates, OA interest rate, SA interest rate, MA interest rate, CPF floor rate, CPF pegged rate, CPF distribution rates, Singapore CPF rates",
    }),
    buildBreadcrumbList([
      { name: "Home", url: BASE_URL },
      { name: "Interest Rates", url: `${BASE_URL}/interest-rates` },
    ]),
    buildDataset({
      name: "CPF Interest Rates Historical Data",
      description:
        "Historical and current CPF interest rates for OA, SA, MA, and RA accounts, including floor rates, SMRA pegged rates, and 10-year SGS yield data.",
      url: `${BASE_URL}/api/cpf/interest-rates`,
      distributions: [
        {
          encodingFormat: "application/json",
          contentUrl: `${BASE_URL}/api/cpf/interest-rates`,
        },
        {
          encodingFormat: "application/json",
          contentUrl: `${BASE_URL}/api/cpf/interest-rates/trend`,
        },
      ],
      variables: [
        "OA interest rate",
        "SA interest rate",
        "MA interest rate",
        "RA interest rate",
        "SMRA pegged rate",
        "10-year SGS yield",
      ],
      temporalCoverage: "2023/2026",
    }),
    buildSpeakable(["h1", "h2"]),
  ]);

  return (
    <>
      <StructuredData data={schema} />
      <PageHeader
        eyebrow="Rates"
        title="Every rate that decides your numbers"
        lede="Two floor rates, one peg, one bonus tier, and a contribution table that changes with your age. This page is the source of every figure elsewhere in SimplyCPF."
      />
      <RateTiles />
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <ContributionRatesTable />
        <QuarterlyRatesTable />
      </div>
      <AllocationByAge />
      <CpfContributionComparisonBlock />
      <CpfDistributionComparisonBlock />
      <CpfInterestTiersBlock />
    </>
  );
}
