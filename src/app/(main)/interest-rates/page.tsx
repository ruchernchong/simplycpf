import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Graph } from "schema-dts";
import DistributionRatesTable from "@/components/interest-rates/distribution-rates-table";
import ExtraInterestTiers from "@/components/interest-rates/extra-interest-tiers";
import { InterestRateTrendChart } from "@/components/interest-rates/interest-rate-trend-chart";
import { QuarterlyRatesTable } from "@/components/interest-rates/quarterly-rates-table";
import RateOverviewCards from "@/components/interest-rates/rate-overview-cards";
import UnderstandingRatesInfo from "@/components/interest-rates/understanding-rates-info";
import CpfContributionComparisonBlock from "@/components/seo/cpf-contribution-comparison-block";
import CpfDistributionComparisonBlock from "@/components/seo/cpf-distribution-comparison-block";
import CpfInterestTiersBlock from "@/components/seo/cpf-interest-tiers-block";
import { StructuredData } from "@/components/seo/structured-data";
import { buttonVariants } from "@/components/ui/button";
import { BASE_URL } from "@/config";
import {
  buildBreadcrumbList,
  buildDataset,
  buildGraph,
  buildPageSchema,
  buildSpeakable,
} from "@/lib/build-schema";
import { cn } from "@/lib/utils";

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

const InterestRatesPage = () => {
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
      <div className="flex flex-col gap-6">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="font-bold text-[30px] text-foreground tracking-tight md:text-[34px]">
            How Much Interest Does Your CPF Earn?
          </h1>
          <p className="interest-rates-description max-w-3xl text-[14px] text-muted-foreground leading-[1.55]">
            Your CPF savings earn guaranteed interest backed by the Singapore
            Government. Your OA earns a floor rate of 2.5% per annum, while your
            SA, MA, and Retirement Account earn interest pegged to the 10-year
            Singapore Government Securities yield plus 1% — with a guaranteed
            minimum of 4% per annum. Below are current rates, historical trends,
            and how your contributions are distributed across accounts for each
            of the 8 age brackets.
          </p>
        </header>

        <RateOverviewCards />
        <ExtraInterestTiers />

        <div className="flex flex-col gap-1 pb-1">
          <h2 className="font-semibold text-[18px] text-foreground">
            How Your CPF Interest Is Determined
          </h2>
          <p className="text-[12px] text-muted-foreground">
            Floor rates, pegged formula, recent trends, and the quarterly rates
            actually paid out.
          </p>
        </div>

        <UnderstandingRatesInfo />

        <section
          aria-label="Where your contributions go by age"
          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold text-[16px] text-foreground">
              Where Your Contributions Go by Age
            </h2>
            <p className="text-[12px] text-muted-foreground">
              Younger members build more in OA for housing; older members direct
              more to SA and MA for retirement and healthcare.
            </p>
          </div>
          <DistributionRatesTable />
        </section>

        <InterestRateTrendChart />
        <QuarterlyRatesTable />

        <div className="flex flex-col gap-1 pb-1">
          <h2 className="font-semibold text-[18px] text-foreground">
            Reference Tables
          </h2>
          <p className="text-[12px] text-muted-foreground">
            Full breakdowns by age group and the extra interest tiers that boost
            your retirement savings.
          </p>
        </div>

        <CpfContributionComparisonBlock />
        <CpfDistributionComparisonBlock />
        <CpfInterestTiersBlock />

        <div className="flex flex-col items-center gap-3 pb-2 text-center">
          <p className="text-[13px] text-muted-foreground">
            Want to see how these rates apply to your salary?
          </p>
          <Link
            href="/calculator"
            className={cn(buttonVariants({ size: "sm" }), "gap-2")}
          >
            Calculate My CPF
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              className="size-4"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </>
  );
};

export default InterestRatesPage;
