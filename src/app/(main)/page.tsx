import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import { HomeConfusions } from "@/components/home/home-confusions";
import { HomeHero } from "@/components/home/home-hero";
import { HomeThreeAges } from "@/components/home/home-three-ages";
import CpfDefinitionBlock from "@/components/seo/cpf-definition-block";
import CpfStatisticBlock from "@/components/seo/cpf-statistic-block";
import { StructuredData } from "@/components/seo/structured-data";
import { StatBand } from "@/components/shared/stat-band";
import { BASE_URL } from "@/config";
import { CPF_INCOME_CEILING } from "@/constants";
import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";
import { getRetirementSumsForYear } from "@/constants/cpf-retirement-sums";
import {
  buildBreadcrumbList,
  buildDataset,
  buildGraph,
  buildSpeakable,
} from "@/lib/build-schema";
import { formatCurrency } from "@/lib/format";

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

export default function HomePage() {
  const { brs, frs, ers } = getRetirementSumsForYear(2026);
  const statBandItems = [
    {
      label: "OA interest",
      value: `${CPF_INTEREST_FLOOR_RATES.OA.toFixed(2)}%`,
      note: "Floor rate",
    },
    {
      label: "SA · MA · RA",
      value: `${CPF_INTEREST_FLOOR_RATES.SMRA.toFixed(2)}%`,
      note: "Plus 1% on first $60k",
    },
    {
      label: "Wage ceiling",
      value: formatCurrency(CPF_INCOME_CEILING["2026-01-01"], 0),
      note: "Final step, Jan 2026",
    },
    {
      label: "FRS 2026",
      value: formatCurrency(frs, 0),
      note: `BRS ${formatCurrency(brs, 0)}`,
    },
    {
      label: "ERS 2026",
      value: formatCurrency(ers, 0),
      note: "4 × BRS since 2025",
    },
  ];

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
    buildSpeakable(["h1"]),
  ]);

  return (
    <>
      <StructuredData data={schema} />
      <HomeHero />
      <HomeConfusions />
      <HomeThreeAges />
      <StatBand items={statBandItems} />
      <div className="flex flex-col gap-12">
        <CpfDefinitionBlock />
        <CpfStatisticBlock />
      </div>
    </>
  );
}
