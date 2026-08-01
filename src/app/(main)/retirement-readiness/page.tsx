import { Typography } from "@heroui/react";
import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import ReadinessScoreForm from "@/components/lead-magnets/readiness-score-form";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, OG_IMAGE, WEBSITE_ID } from "@/config";

const PAGE_URL = `${BASE_URL}/retirement-readiness`;
const PAGE_TITLE = "SimplyCPF Retirement Readiness Rubric";
const PAGE_DESCRIPTION =
  "Use SimplyCPF's five-question editorial rubric to spot a CPF planning topic to review next. It is not a CPF Board assessment or a measure of retirement adequacy.";

export const metadata: Metadata = {
  title: "SimplyCPF Retirement Readiness Rubric",
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: "/retirement-readiness",
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

const schema: Graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}/#webpage`,
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url: PAGE_URL,
      inLanguage: "en-SG",
      isPartOf: { "@id": WEBSITE_ID },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "[data-readiness-intro]"],
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: PAGE_TITLE,
          item: PAGE_URL,
        },
      ],
    },
  ],
};

export default function RetirementReadinessPage() {
  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <Typography align="center" className="mb-4" type="h1">
            How Ready Is Your CPF Plan?
          </Typography>
          <Typography
            align="center"
            className="mx-auto max-w-3xl"
            color="muted"
            data-readiness-intro
          >
            This 5-question score is meant to surface the next CPF planning gap
            worth fixing. It is a SimplyCPF editorial rubric, not a CPF Board
            assessment or a guarantee of retirement adequacy. Use it to choose
            between the projection, CPF LIFE reference, and contribution tools.
          </Typography>
        </div>
        <ReadinessScoreForm />
      </div>
    </>
  );
}
