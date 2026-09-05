import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import { HomeHero } from "@/components/home/home-hero";
import { HomeJourneys } from "@/components/home/home-journeys";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, OG_BASE, OG_IMAGE, WEBSITE_ID } from "@/config";

export const metadata: Metadata = {
  // `absolute` opts out of the root title template, which would otherwise
  // append "| SimplyCPF" to a title that already leads with the site name.
  title: {
    absolute: "SimplyCPF: Free CPF Calculator and Planning Tools for Singapore",
  },
  description:
    "Free CPF calculator and planning tools for Singapore. Calculate CPF contributions, project balances to retirement, compare CPF LIFE payouts, and keep a CPF cheat sheet close by.",
  keywords:
    "CPF contribution calculator, CPF calculator Singapore, CPF income ceiling, CPF ceiling change, CPF ceiling timeline, CPF $6000 to $8000, Budget 2023 CPF, progressive ceiling, Singapore CPF, take-home pay CPF",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    ...OG_BASE,
    title: "SimplyCPF: Free CPF Contribution Calculator for Singapore",
    url: BASE_URL,
    images: [
      {
        ...OG_IMAGE,
        alt: "SimplyCPF: Free CPF Contribution Calculator for Singapore",
      },
    ],
  },
};

export default function HomePage() {
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
          "Contribution rates, distribution rates, and income ceiling data for Singapore CPF across 8 age brackets, including progressive ceiling changes from 2023 to 2026.",
        url: `${BASE_URL}/api/cpf/age-groups`,
        creator: { "@id": `${BASE_URL}/#organization` },
        isAccessibleForFree: true,
        license: "https://creativecommons.org/licenses/by/4.0/",
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
          "MA distribution rate",
          "Income ceiling",
        ],
        temporalCoverage: "2023/2026",
      },
    ],
  };

  return (
    <>
      <StructuredData data={schema} />
      <HomeHero />
      <HomeJourneys />
    </>
  );
}
