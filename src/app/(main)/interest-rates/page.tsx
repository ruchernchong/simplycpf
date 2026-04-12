import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Graph } from "schema-dts";
import CPFInterestRatesSection from "@/components/interest-rates/cpf-interest-rates-section";
import DistributionRatesTable from "@/components/interest-rates/distribution-rates-table";
import CpfContributionComparisonBlock from "@/components/seo/cpf-contribution-comparison-block";
import CpfDistributionComparisonBlock from "@/components/seo/cpf-distribution-comparison-block";
import { StructuredData } from "@/components/seo/structured-data";
import { buttonVariants } from "@/components/ui/button";
import { BASE_URL } from "@/config";
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
  const schema: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "CPF Interest Rates",
        description:
          "View current CPF interest rates for OA, SA, and MA accounts. Understand floor rates vs pegged rates, see historical trends, and learn contribution distribution rates by age group.",
        url: `${BASE_URL}/interest-rates`,
        inLanguage: "en-SG",
        keywords:
          "CPF interest rates, OA interest rate, SA interest rate, MA interest rate, CPF floor rate, CPF pegged rate, CPF distribution rates, Singapore CPF rates",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: BASE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Interest Rates",
            item: `${BASE_URL}/interest-rates`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-12">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-3xl text-foreground tracking-tight md:text-4xl">
            How Much Interest Does Your CPF Earn?
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Your CPF savings earn guaranteed interest backed by the Singapore
            Government. Your OA earns a floor rate of 2.5% per annum, while your
            SA, MA, and Retirement Account earn interest pegged to the 10-year
            Singapore Government Securities yield plus 1% — with a guaranteed
            minimum of 4% per annum. Below are current rates, historical trends,
            and how your contributions are distributed across accounts for each
            of the 8 age brackets.
          </p>
        </div>
        <div>
          <h2 className="mb-6 font-semibold text-2xl">
            How Your CPF Interest Is Determined
          </h2>
          <CPFInterestRatesSection />
        </div>
        <div>
          <h2 className="mb-6 font-semibold text-2xl">
            Where Your CPF Contributions Go by Age
          </h2>
          <DistributionRatesTable />
        </div>
        <CpfContributionComparisonBlock />
        <CpfDistributionComparisonBlock />
        <div className="text-center">
          <p className="mb-4 font-medium text-foreground text-lg">
            Want to see how these rates apply to your salary?
          </p>
          <Link
            href="/calculator"
            className={cn(buttonVariants({ size: "lg" }), "gap-2")}
          >
            Calculate My CPF
            <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" />
          </Link>
        </div>
      </div>
    </>
  );
};

export default InterestRatesPage;
