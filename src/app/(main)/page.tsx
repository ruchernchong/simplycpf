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
import { formatCurrency } from "@/lib/format";
import { CPF_POLICY_CATALOGUE, resolveContributionSchedule } from "@/policy";

const currentSchedule = resolveContributionSchedule(
  CPF_POLICY_CATALOGUE.metadata["cpf-contribution-rates"].verifiedAt,
).schedule;
const currentPolicyYear = Number(currentSchedule.effectiveFrom.slice(0, 4));
const currentRetirementSums = CPF_POLICY_CATALOGUE.retirementSums.find(
  (row) => row.year === currentPolicyYear,
);
const latestInterestDeclaration =
  CPF_POLICY_CATALOGUE.quarterlyInterestRates.at(-1);
const earliestSchedule = CPF_POLICY_CATALOGUE.contributionSchedules.at(0);
const latestSchedule = CPF_POLICY_CATALOGUE.contributionSchedules.at(-1);
const retirementAge =
  CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;

export const metadata: Metadata = {
  // `absolute` opts out of the root title template, which would otherwise
  // append "| SimplyCPF" to a title that already leads with the site name.
  title: {
    absolute: "SimplyCPF: Free CPF Calculator and Planning Tools for Singapore",
  },
  description:
    "Free CPF tools for Singapore. Calculate contributions, project balances with explicit assumptions, and review official CPF LIFE reference rows.",
  keywords:
    "CPF contribution calculator, CPF calculator Singapore, CPF income ceiling, CPF ceiling change, CPF ceiling timeline, Singapore CPF, take-home pay CPF",
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
  if (!currentRetirementSums || !latestInterestDeclaration) {
    throw new Error("The current CPF reference data is unavailable.");
  }

  const { brs, frs, ers, ersMultipleOfBrs, year } = currentRetirementSums;
  const statBandItems = [
    {
      label: "OA interest",
      value: `${CPF_POLICY_CATALOGUE.interestRateMethodology.ordinaryAccount.floorRate.toFixed(2)}%`,
      note: "Floor rate",
    },
    {
      label: "SA · MA · RA",
      value: `${latestInterestDeclaration.ra.toFixed(2)}%`,
      note: `Declared for ${latestInterestDeclaration.quarter}`,
    },
    {
      label: "Wage ceiling",
      value: formatCurrency(currentSchedule.ordinaryWageCeiling, 0),
      note: `Schedule from ${currentSchedule.effectiveFrom}`,
    },
    {
      label: `FRS ${year}`,
      value: formatCurrency(frs, 0),
      note: `BRS ${formatCurrency(brs, 0)}`,
    },
    {
      label: `ERS ${year}`,
      value: formatCurrency(ers, 0),
      note: `${ersMultipleOfBrs} × BRS`,
    },
  ];

  const schema: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/#webpage`,
        name: "SimplyCPF",
        description: `Work out your CPF contributions, project your balances, and see what changes at ${retirementAge}.`,
        url: BASE_URL,
        inLanguage: "en-SG",
        dateModified:
          CPF_POLICY_CATALOGUE.metadata["cpf-contribution-rates"].verifiedAt,
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
          "View OA, SA, RA and MA allocation",
          "Track every published income-ceiling schedule",
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
        description: `Official contribution schedules, allocation rates, and wage ceilings for supported private-sector Singapore Citizen and default G/G SPR scenarios from ${earliestSchedule?.effectiveFrom ?? "the first published schedule"} through ${latestSchedule?.effectiveTo ?? "the latest published schedule"}.`,
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
        temporalCoverage:
          earliestSchedule && latestSchedule
            ? `${earliestSchedule.effectiveFrom}/${latestSchedule.effectiveTo}`
            : undefined,
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
