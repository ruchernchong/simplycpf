import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import { HomeConfusions } from "@/components/home/home-confusions";
import { HomeHero } from "@/components/home/home-hero";
import { HomeThreeAges } from "@/components/home/home-three-ages";
import CpfDefinitionBlock from "@/components/seo/cpf-definition-block";
import CpfStatisticBlock from "@/components/seo/cpf-statistic-block";
import { StructuredData } from "@/components/seo/structured-data";
import { StatBand } from "@/components/shared/stat-band";
import { BASE_URL, WEBSITE_ID } from "@/config";
import { CPF_INCOME_CEILING } from "@/constants";
import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";
import { getRetirementSumsForYear } from "@/constants/cpf-retirement-sums";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  // `absolute` opts out of the root title template, which would otherwise
  // append "| SimplyCPF" to a title that already leads with the site name.
  title: {
    absolute: "SimplyCPF: Free CPF Calculator and Planning Tools for Singapore",
  },
  description:
    "Free CPF tools for Singapore. Calculate contributions, project balances with explicit assumptions, and review official CPF LIFE reference rows.",
  keywords:
    "CPF contribution calculator, CPF calculator Singapore, CPF income ceiling, CPF ceiling change, CPF ceiling timeline, CPF $6000 to $8000, Budget 2023 CPF, progressive ceiling, Singapore CPF, take-home pay CPF",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SimplyCPF: Free CPF Contribution Calculator for Singapore",
    description:
      "Calculate CPF contributions, project balances with explicit assumptions, and review official CPF LIFE reference rows.",
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "SimplyCPF: Free CPF Contribution Calculator for Singapore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SimplyCPF: Free CPF Contribution Calculator for Singapore",
    description:
      "Calculate CPF contributions, project balances with explicit assumptions, and review official CPF LIFE reference rows.",
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
      note: "Declared for 2026 Q3",
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

  const schema: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/#webpage`,
        name: "SimplyCPF",
        description:
          "Work out your CPF contributions, project your balances, and see what changes at 55.",
        url: BASE_URL,
        inLanguage: "en-SG",
        isPartOf: { "@id": WEBSITE_ID },
        speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1"] },
      },
      {
        "@type": "SoftwareApplication" as const,
        name: "SimplyCPF",
        description:
          "Free CPF tools for Singapore. Calculate source-backed contributions, project balances with labelled assumptions, and review official CPF LIFE reference rows.",
        url: BASE_URL,
        applicationCategory: "FinanceApplication",
        featureList: [
          "Calculate CPF contributions by age group and income",
          "View distribution across OA, SA, MA accounts",
          "Track progressive income ceiling changes from 2023 to 2026",
          "Download a CPF cheat sheet",
          "Use a SimplyCPF retirement-readiness rubric",
          "Compare CPF floor rates with editable investment-return assumptions",
          "Access official quarterly CPF interest declarations",
        ],
        inLanguage: "en-SG",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        ],
      },
      {
        "@type": "Dataset",
        name: "CPF Contribution Rates by Age Group",
        description:
          "Official contribution schedules, allocation rates, and wage ceilings for supported private-sector Singapore Citizen and default G/G SPR scenarios from 2023 through 2027.",
        url: `${BASE_URL}/api/cpf/age-groups`,
        creator: { "@id": `${BASE_URL}/#organization` },
        isAccessibleForFree: true,
        distribution: [
          {
            "@type": "DataDownload",
            encodingFormat: "application/json",
            contentUrl: `${BASE_URL}/api/cpf/age-groups`,
          },
          {
            "@type": "DataDownload",
            encodingFormat: "application/json",
            contentUrl: `${BASE_URL}/api/cpf/ceiling/timeline`,
          },
        ],
        variableMeasured: [
          "Employee contribution rate",
          "Employer contribution rate",
          "OA distribution rate",
          "SA distribution rate",
          "RA distribution rate after SA closure",
          "MA distribution rate",
          "Income ceiling",
        ],
        temporalCoverage: "2023/2027",
      },
    ],
  };

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
