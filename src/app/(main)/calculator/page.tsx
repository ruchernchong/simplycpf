import type { Metadata } from "next";
import { createSearchParamsCache, parseAsInteger } from "nuqs/server";
import type { Graph } from "schema-dts";
import { CalculatorActions } from "@/components/calculator/calculator-actions";
import CalculatorContent from "@/components/calculator/calculator-content";
import CpfAgeSpecificBlock from "@/components/seo/cpf-age-specific-block";
import IncomeCeilingDefinitionBlock from "@/components/seo/income-ceiling-definition-block";
import { StructuredData } from "@/components/seo/structured-data";
import { PageHeader } from "@/components/shared/section-header";
import { BASE_URL, WEBSITE_ID } from "@/config";
import { faqCalculatorData } from "@/data/cpf-faqs";
import { findAgeGroup } from "@/lib/find-age-group";
import { formatCurrency } from "@/lib/format";
import { CPF_POLICY_CATALOGUE } from "@/policy";

const ceilingChanges = CPF_POLICY_CATALOGUE.contributionSchedules.filter(
  (schedule, index, schedules) =>
    index === 0 ||
    schedule.ordinaryWageCeiling !== schedules[index - 1]?.ordinaryWageCeiling,
);
function requireCeiling(
  value: (typeof ceilingChanges)[number] | undefined,
): (typeof ceilingChanges)[number] {
  if (!value) {
    throw new Error("The CPF Ordinary Wage ceiling timeline is unavailable.");
  }
  return value;
}
const firstCeiling = requireCeiling(ceilingChanges.at(0));
const latestCeiling = requireCeiling(ceilingChanges.at(-1));

const searchParamsCache = createSearchParamsCache({
  age: parseAsInteger,
});

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { age } = await searchParamsCache.parse(searchParams);

  if (!age) {
    return {
      title: "CPF Contribution Calculator: Know Your Take-Home Pay After CPF",
      description:
        "Free CPF contribution calculator for Singapore employees and employers. See exactly how much goes into OA, SA or RA, and MA, what your employer contributes, and how the rising income ceiling changes your take-home pay.",
      keywords:
        "CPF contribution calculator, CPF calculator, CPF deduction, take-home pay calculator Singapore, CPF contribution rate by age, CPF employee employer contribution, CPF OA SA MA distribution, Singapore CPF calculator",
      alternates: {
        canonical: "/calculator",
      },
      openGraph: {
        title:
          "CPF Contribution Calculator | Know Your Take-Home Pay After CPF",
        description:
          "Free CPF contribution calculator. See how much goes into OA, SA or RA, and MA, what your employer contributes, and how the rising ceiling affects your pay.",
        url: `${BASE_URL}/calculator`,
        images: [
          {
            url: `${BASE_URL}/opengraph-image`,
            width: 1200,
            height: 630,
            alt: "CPF Contribution Calculator, SimplyCPF",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title:
          "CPF Contribution Calculator | Know Your Take-Home Pay After CPF",
        description:
          "Free CPF contribution calculator. See how much goes into OA, SA or RA, and MA, what your employer contributes, and how the rising ceiling affects your pay.",
        images: [`${BASE_URL}/opengraph-image`],
      },
    };
  }

  const ageGroup = findAgeGroup(age);
  const totalRate =
    (ageGroup.contributionRate.employee + ageGroup.contributionRate.employer) *
    100;

  return {
    title: `CPF Calculator for ${ageGroup.description} | Singapore`,
    description: `Calculate CPF contributions for employees ${ageGroup.description.toLowerCase()}. See the ${totalRate}% total rate, OA/SA/RA/MA allocation, and take-home pay impact.`,
    keywords: `CPF calculator ${ageGroup.description.toLowerCase()}, CPF contribution rate ${age}, CPF ${age} years old, Singapore CPF calculator age ${age}`,
    alternates: {
      canonical: `/calculator?age=${age}`,
    },
    openGraph: {
      title: `CPF Calculator for ${ageGroup.description} | Singapore`,
      description: `Calculate CPF contributions for employees ${ageGroup.description.toLowerCase()}. See the ${totalRate}% total rate, OA/SA/RA/MA allocation, and take-home pay impact.`,
      url: `${BASE_URL}/calculator?age=${age}`,
      images: [
        {
          url: `${BASE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `CPF Calculator for ${ageGroup.description}, SimplyCPF`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `CPF Calculator for ${ageGroup.description} | Singapore`,
      description: `Calculate CPF contributions for employees ${ageGroup.description.toLowerCase()}. See the ${totalRate}% total rate, OA/SA/RA/MA allocation, and take-home pay impact.`,
      images: [`${BASE_URL}/opengraph-image`],
    },
  };
}

async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { age } = await searchParamsCache.parse(searchParams);
  const ageGroup = age ? findAgeGroup(age) : null;

  const schema: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/calculator/#webpage`,
        name: ageGroup
          ? `SimplyCPF Calculator, ${ageGroup.description}`
          : "SimplyCPF Calculator",
        description:
          "Free CPF contribution calculator for Singapore employees and employers. Calculate employee and employer CPF contributions by age group, view OA/SA/RA/MA allocation, and track income ceiling impacts on take-home pay.",
        url: ageGroup
          ? `${BASE_URL}/calculator?age=${age}`
          : `${BASE_URL}/calculator`,
        inLanguage: "en-SG",
        dateModified:
          CPF_POLICY_CATALOGUE.metadata["cpf-contribution-rates"].verifiedAt,
        isPartOf: { "@id": WEBSITE_ID },
        keywords:
          "CPF contribution calculator, CPF calculator, CPF deduction, take-home pay calculator Singapore, CPF contribution rate by age",
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", ".calculator-results"],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Calculator",
            item: `${BASE_URL}/calculator`,
          },
        ],
      },
      {
        "@type": "HowTo",
        name: "How to calculate your CPF contributions",
        description:
          "Follow these steps to calculate your CPF employee and employer contributions, view OA/SA/RA/MA allocation, and understand how income ceiling changes affect your take-home pay.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Enter your monthly income",
            text: "Enter your monthly gross income in Singapore dollars. CPF contributions are calculated based on your total monthly wages subject to CPF.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Select your birth date to determine age group",
            text: "Select your date of birth. Your completed age determines the applicable inclusive-upper contribution and allocation bands, with a new rate starting only in the month after a threshold birthday.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Choose the income ceiling period",
            text: `Select the relevant contribution period. The published OW ceiling timeline runs from ${formatCurrency(firstCeiling.ordinaryWageCeiling, 0)} in ${firstCeiling.effectiveFrom} to ${formatCurrency(latestCeiling.ordinaryWageCeiling, 0)} in ${latestCeiling.effectiveFrom}.`,
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "View your CPF contribution breakdown",
            text: "Review employee and employer contribution amounts, OA/SA/RA/MA allocation, and the impact on your take-home pay.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqCalculatorData.map(({ question, answer }) => ({
          "@type": "Question" as const,
          name: question,
          acceptedAnswer: { "@type": "Answer" as const, text: answer },
        })),
      },
      {
        "@type": "SoftwareApplication",
        name: "SimplyCPF Calculator",
        url: `${BASE_URL}/calculator`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "SGD" },
        featureList: [
          "Calculate CPF contributions by age group and income",
          "View OA, SA, RA and MA allocation",
          `Track published income ceiling changes from ${firstCeiling.effectiveFrom} to ${latestCeiling.effectiveFrom}`,
        ],
      },
    ],
  };

  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-8">
        <PageHeader
          actions={<CalculatorActions />}
          eyebrow="This month"
          title="Where this month's money went"
        />
        <CalculatorContent />
        {ageGroup && age !== null && (
          <CpfAgeSpecificBlock ageGroup={ageGroup} exactAge={age} />
        )}
        <IncomeCeilingDefinitionBlock />
      </div>
    </>
  );
}

export default CalculatorPage;
