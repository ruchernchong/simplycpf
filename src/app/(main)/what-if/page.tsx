import type { Metadata } from "next";
import { Suspense } from "react";
import { StructuredData } from "@/components/seo/structured-data";
import WhatIfContent from "@/components/what-if/what-if-content";
import { BASE_URL } from "@/config";
import {
  buildGraph,
  buildHowTo,
  buildPageSchema,
  buildWebApplication,
  pageBreadcrumb,
} from "@/lib/build-schema";

export const metadata: Metadata = {
  title: "CPF What-If Simulator | Compare Salary, Top-Ups and OA to SA Moves",
  description:
    "Run CPF what-if scenarios in seconds. Compare salary changes, OA to SA transfers, annual top-ups, and the cost of delaying your CPF journey.",
  keywords:
    "CPF what-if calculator, CPF salary increase calculator, OA to SA transfer calculator, CPF top-up calculator, CPF delay comparison",
  alternates: {
    canonical: "/what-if",
  },
  openGraph: {
    title: "CPF What-If Simulator | Compare CPF Scenarios",
    description:
      "Compare CPF scenarios like salary increases, annual top-ups, OA to SA transfers, and delayed starts.",
    url: `${BASE_URL}/what-if`,
    images: [
      {
        url: `${BASE_URL}/what-if/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "CPF What-If Simulator - SimplyCPF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF What-If Simulator | Compare CPF Scenarios",
    description:
      "Compare CPF scenarios like salary increases, annual top-ups, OA to SA transfers, and delayed starts.",
    images: [`${BASE_URL}/what-if/opengraph-image`],
  },
};

const schema = buildGraph([
  buildPageSchema({
    name: "CPF What-If Simulator",
    description:
      "Compare CPF scenarios like salary changes, annual top-ups, OA to SA transfers, and delayed starts using the SimplyCPF projection engine.",
    url: `${BASE_URL}/what-if`,
    speakableSelectors: ["h1", "[data-what-if-intro]"],
    keywords:
      "CPF what-if calculator, OA to SA transfer, CPF top-up calculator, CPF salary change",
  }),
  pageBreadcrumb("What-If", `${BASE_URL}/what-if`),
  buildHowTo(
    "How to compare CPF what-if scenarios",
    "Pick a scenario, enter your assumptions, and compare the baseline outcome against the alternative CPF path.",
    [
      {
        name: "Choose a scenario",
        text: "Pick salary change, OA to SA transfer, top-up, or age comparison.",
      },
      {
        name: "Enter your CPF assumptions",
        text: "Add your monthly income, age or birth date, citizenship status, and the scenario-specific inputs.",
      },
      {
        name: "Review the side-by-side outcome",
        text: "Compare the baseline and scenario balances, CPF LIFE estimates, and key differences at age 65.",
      },
    ],
  ),
  buildWebApplication({
    name: "SimplyCPF What-If Simulator",
    url: `${BASE_URL}/what-if`,
    featureList: [
      "Compare salary change scenarios",
      "Model OA to SA transfers",
      "Estimate top-up impact",
      "Compare the cost of delaying CPF contributions",
    ],
  }),
]);

export default function WhatIfPage() {
  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-3xl text-foreground tracking-tight md:text-4xl">
            What If You Changed One CPF Decision Today?
          </h1>
          <p
            data-what-if-intro
            className="mx-auto max-w-3xl text-muted-foreground"
          >
            Compare the likely CPF outcome of a salary change, an OA to SA
            transfer, an annual top-up, or simply starting earlier. The goal is
            not to guess perfectly. It is to help you see which decision matters
            most before you commit.
          </p>
        </div>
        <Suspense
          fallback={<div className="min-h-[480px] rounded-lg bg-muted/30" />}
        >
          <WhatIfContent />
        </Suspense>
      </div>
    </>
  );
}
