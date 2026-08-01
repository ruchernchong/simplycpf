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
import { BASE_URL, WEBSITE_ID } from "@/config";

export const metadata: Metadata = {
  title: "CPF Interest Rates: How Much Does Your OA, SA & MA Earn?",
  description:
    "See CPF Board's declared quarterly OA and SMRA rates through 2026 Q3, the published floor rates, and the documented 3-month bank-rate and 12-month 10YSGS methodologies.",
  keywords:
    "CPF interest rates, OA interest rate, SA interest rate, MA interest rate, CPF floor rate, CPF pegged rate, SGS yield, CPF distribution rates, CPF contribution distribution by age, Singapore CPF rates, SMRA interest rate",
  alternates: {
    canonical: "/interest-rates",
  },
  openGraph: {
    title: "CPF Interest Rates: How Much Does Your OA, SA & MA Earn?",
    description:
      "See official quarterly CPF interest declarations through 2026 Q3 and understand the published OA and SMRA methodologies.",
    url: `${BASE_URL}/interest-rates`,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "CPF Interest Rates, SimplyCPF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF Interest Rates: How Much Does Your OA, SA & MA Earn?",
    description:
      "See official quarterly CPF interest declarations through 2026 Q3 and understand the published OA and SMRA methodologies.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

export default function InterestRatesPage() {
  const schema: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/interest-rates/#webpage`,
        name: "CPF Interest Rates",
        description:
          "View CPF Board's quarterly OA and SMRA declarations, floor rates, and published rate-setting methodologies.",
        url: `${BASE_URL}/interest-rates`,
        inLanguage: "en-SG",
        isPartOf: { "@id": WEBSITE_ID },
        keywords:
          "CPF interest rates, OA interest rate, SA interest rate, MA interest rate, CPF floor rate, CPF pegged rate, CPF distribution rates, Singapore CPF rates",
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "h2", ".interest-rates-description"],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Interest Rates",
            item: `${BASE_URL}/interest-rates`,
          },
        ],
      },
      {
        "@type": "Dataset",
        name: "CPF Interest Rates Historical Data",
      description:
        "Official quarterly CPF interest declarations for OA, SA, MA, and RA accounts, with source URLs and verification dates. No reconstructed monthly SGS series is included.",
        url: `${BASE_URL}/api/cpf/interest-rates`,
        creator: { "@id": `${BASE_URL}/#organization` },
        isAccessibleForFree: true,
        license: "https://creativecommons.org/licenses/by/4.0/",
        distribution: [
          {
            "@type": "DataDownload",
            encodingFormat: "application/json",
            contentUrl: `${BASE_URL}/api/cpf/interest-rates`,
          },
          {
            "@type": "DataDownload",
            encodingFormat: "application/json",
            contentUrl: `${BASE_URL}/api/cpf/interest-rates/trend`,
          },
        ],
        variableMeasured: [
          "OA interest rate",
          "SA interest rate",
          "MA interest rate",
          "RA interest rate",
          "SMRA pegged rate",
          "10-year SGS yield",
        ],
        temporalCoverage: "2024/2026-Q3",
      },
    ],
  };

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
