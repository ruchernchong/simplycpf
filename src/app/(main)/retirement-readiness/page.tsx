import { Typography } from "@heroui/react";
import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import ReadinessScoreForm from "@/components/lead-magnets/readiness-score-form";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, OG_IMAGE, WEBSITE_ID } from "@/config";

const PAGE_URL = `${BASE_URL}/retirement-readiness`;
const PAGE_TITLE = "Retirement Readiness Score";
const PAGE_DESCRIPTION =
  "Answer 5 quick questions to estimate how prepared your CPF planning is and which SimplyCPF tool to use next.";

export const metadata: Metadata = {
  title: "Retirement Readiness Score: See What Your CPF Plan Is Missing",
  description:
    "Answer 5 quick questions to see where your CPF planning is clear, weak, or missing, then get the next tool to use inside SimplyCPF.",
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
      name: "Retirement Readiness Score",
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
          name: "Retirement Readiness Score",
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
            worth fixing. It is not a guarantee of retirement adequacy. It is a
            faster way to decide whether you should use the projection tool, the
            CPF LIFE estimator, or the calculator next.
          </Typography>
        </div>
        <ReadinessScoreForm />
      </div>
    </>
  );
}
