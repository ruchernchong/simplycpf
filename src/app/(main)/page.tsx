import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import BreakdownCta from "@/components/home/breakdown-cta";
import HeroSection from "@/components/home/hero-section";
import InsightBanner from "@/components/home/insight-banner";
import QuickActions from "@/components/home/quick-actions";
import CpfDefinitionBlock from "@/components/seo/cpf-definition-block";
import CpfStatisticBlock from "@/components/seo/cpf-statistic-block";
import { StructuredData } from "@/components/seo/structured-data";
import CPFIncomeCeilingTimeline from "@/components/timeline/cpf-income-ceiling-timeline";
import { BASE_URL } from "@/config";
import {
  buildBreadcrumbList,
  buildDataset,
  buildGraph,
  buildSpeakable,
} from "@/lib/build-schema";

export const metadata: Metadata = {
  title: "SimplyCPF — Free CPF Calculator and Planning Tools for Singapore",
  description:
    "Free CPF calculator and planning tools for Singapore. Calculate CPF contributions, project balances to retirement, compare CPF LIFE payouts, and keep a CPF cheat sheet close by.",
  keywords:
    "CPF contribution calculator, CPF calculator Singapore, CPF income ceiling, CPF ceiling change, CPF ceiling timeline, CPF $6000 to $8000, Budget 2023 CPF, progressive ceiling, Singapore CPF, take-home pay CPF",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SimplyCPF — Free CPF Contribution Calculator for Singapore",
    description:
      "Free CPF calculator and planning tools for Singapore. Calculate CPF contributions, project balances to retirement, compare CPF LIFE payouts, and keep a CPF cheat sheet close by.",
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "SimplyCPF — Free CPF Contribution Calculator for Singapore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SimplyCPF — Free CPF Contribution Calculator for Singapore",
    description:
      "Free CPF calculator and planning tools for Singapore. Calculate CPF contributions, project balances to retirement, compare CPF LIFE payouts, and keep a CPF cheat sheet close by.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

const HomePage = () => {
  const schema: Graph = buildGraph([
    {
      "@type": "SoftwareApplication" as const,
      name: "SimplyCPF",
      description:
        "Free CPF calculator and planning tools for Singapore. Calculate contributions, project balances, compare CPF LIFE payouts, and review CPF reference numbers in one place.",
      url: BASE_URL,
      applicationCategory: "FinanceApplication",
      featureList: [
        "Calculate CPF contributions by age group and income",
        "View distribution across OA, SA, MA accounts",
        "Track progressive income ceiling changes from 2023 to 2026",
        "Download a CPF cheat sheet",
        "Check a retirement readiness score",
        "Compare CPF returns against investment options",
        "Access current CPF interest rates and distribution rates",
      ],
      inLanguage: "en-SG",
    },
    buildBreadcrumbList([{ name: "Home", url: BASE_URL }]),
    buildDataset({
      name: "CPF Contribution Rates by Age Group",
      description:
        "Contribution rates, distribution rates, and income ceiling data for Singapore CPF across 8 age brackets, including progressive ceiling changes from 2023 to 2026.",
      url: `${BASE_URL}/api/cpf/age-groups`,
      distributions: [
        {
          encodingFormat: "application/json",
          contentUrl: `${BASE_URL}/api/cpf/age-groups`,
        },
        {
          encodingFormat: "application/json",
          contentUrl: `${BASE_URL}/api/cpf/ceiling/timeline`,
        },
      ],
      variables: [
        "Employee contribution rate",
        "Employer contribution rate",
        "OA distribution rate",
        "SA distribution rate",
        "MA distribution rate",
        "Income ceiling",
      ],
      temporalCoverage: "2023/2026",
    }),
    buildSpeakable(["h1", ".hero-description", ".insight-banner"]),
  ]);

  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-8">
        <HeroSection />
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <CPFIncomeCeilingTimeline />
          <div className="flex flex-col gap-4">
            <InsightBanner />
            <QuickActions />
          </div>
        </div>
        <CpfDefinitionBlock />
        <CpfStatisticBlock />
        <BreakdownCta />
      </div>
    </>
  );
};

export default HomePage;
