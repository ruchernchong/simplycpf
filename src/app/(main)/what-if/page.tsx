import type { Metadata } from "next";
import { Suspense } from "react";
import type { Graph } from "schema-dts";
import { StructuredData } from "@/components/seo/structured-data";
import WhatIfContent from "@/components/what-if/what-if-content";
import { BASE_URL, OG_BASE_WITHOUT_IMAGE, WEBSITE_ID } from "@/config";

export const metadata: Metadata = {
  title: "CPF What-If Simulator: Compare Salary, Top-Ups and OA to SA Moves",
  description:
    "Run CPF what-if scenarios in seconds. Compare salary changes, OA to SA transfers, annual top-ups, and the cost of delaying your CPF journey.",
  keywords:
    "CPF what-if calculator, CPF salary increase calculator, OA to SA transfer calculator, CPF top-up calculator, CPF delay comparison",
  alternates: {
    canonical: "/what-if",
  },
  openGraph: {
    ...OG_BASE_WITHOUT_IMAGE,
    title: "CPF What-If Simulator: Compare CPF Scenarios",
    description:
      "Compare CPF scenarios like salary increases, annual top-ups, OA to SA transfers, and delayed starts.",
    url: `${BASE_URL}/what-if`,
  },
  /*
   * Replaces the layout's twitter block so its pinned site image does not win
   * over the opengraph-image.tsx this route generates for itself.
   */
  twitter: {
    card: "summary_large_image",
  },
};

const schema: Graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/what-if/#webpage`,
      name: "CPF What-If Simulator",
      description:
        "Compare CPF scenarios like salary changes, annual top-ups, OA to SA transfers, and delayed starts using the SimplyCPF projection engine.",
      url: `${BASE_URL}/what-if`,
      inLanguage: "en-SG",
      isPartOf: { "@id": WEBSITE_ID },
      keywords:
        "CPF what-if calculator, OA to SA transfer, CPF top-up calculator, CPF salary change",
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1"] },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "What-If",
          item: `${BASE_URL}/what-if`,
        },
      ],
    },
    {
      "@type": "HowTo",
      name: "How to compare CPF what-if scenarios",
      description:
        "Pick a scenario, enter your assumptions, and compare the baseline outcome against the alternative CPF path.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Choose a scenario",
          text: "Pick salary change, OA to SA transfer, top-up, or age comparison.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Enter your CPF assumptions",
          text: "Add your monthly income, age or birth date, citizenship status, and the scenario-specific inputs.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Review the side-by-side outcome",
          text: "Compare the baseline and scenario balances, CPF LIFE estimates, and key differences at age 65.",
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      name: "SimplyCPF What-If Simulator",
      url: `${BASE_URL}/what-if`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "SGD" },
      featureList: [
        "Compare salary change scenarios",
        "Model OA to SA transfers",
        "Estimate top-up impact",
        "Compare the cost of delaying CPF contributions",
      ],
    },
  ],
};

export default function WhatIfPage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-[480px] rounded-lg bg-surface-secondary" />
        }
      >
        <WhatIfContent />
      </Suspense>
      <StructuredData data={schema} />
    </>
  );
}
