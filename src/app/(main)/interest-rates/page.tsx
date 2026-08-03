import { Typography } from "@heroui/react";
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
import { BASE_URL, OG_BASE, OG_IMAGE, WEBSITE_ID } from "@/config";

export const metadata: Metadata = {
  title: "CPF Interest Rates: How Much Does Your OA, SA & MA Earn?",
  description:
    "See current CPF interest rates for your Ordinary, Special, and MediSave accounts. Understand the guaranteed floor rates, how SMRA rates are pegged, and view contribution distribution rates across all 8 age brackets.",
  keywords:
    "CPF interest rates, OA interest rate, SA interest rate, MA interest rate, CPF floor rate, CPF pegged rate, SGS yield, CPF distribution rates, CPF contribution distribution by age, Singapore CPF rates, SMRA interest rate",
  alternates: {
    canonical: "/interest-rates",
  },
  openGraph: {
    ...OG_BASE,
    description:
      "See current CPF interest rates for OA, SA, and MA. Understand guaranteed floor rates, SMRA pegged rates, and view distribution rates by age group.",
    url: `${BASE_URL}/interest-rates`,
    images: [{ ...OG_IMAGE, alt: "CPF Interest Rates, SimplyCPF" }],
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
          "View current CPF interest rates for OA, SA, and MA accounts. Understand floor rates vs pegged rates, see historical trends, and learn contribution distribution rates by age group.",
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
          "Historical and current CPF interest rates for OA, SA, MA, and RA accounts, including floor rates, SMRA pegged rates, and 10-year SGS yield data.",
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
        temporalCoverage: "2023/2026",
      },
    ],
  };

  return (
    <>
      <StructuredData data={schema} />
      <header className="flex flex-col gap-2">
        <span className="font-mono text-[10.5px] text-muted uppercase tracking-[0.13em]">
          Rates
        </span>
        <Typography type="h1">Every rate that decides your numbers</Typography>
        <div className="max-w-[76ch]">
          <Typography color="muted">
            Two floor rates, one peg, one bonus tier, and a contribution table
            that changes with your age. This page is the source of every figure
            elsewhere in SimplyCPF.
          </Typography>
        </div>
      </header>
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
