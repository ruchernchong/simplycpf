import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import ReadinessScoreForm from "@/components/lead-magnets/readiness-score-form";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL } from "@/config";
import {
  buildGraph,
  buildPageSchema,
  pageBreadcrumb,
} from "@/lib/build-schema";

export const metadata: Metadata = {
  title: "Retirement Readiness Score | See What Your CPF Plan Is Missing",
  description:
    "Answer 5 quick questions to see where your CPF planning is clear, weak, or missing, then get the next tool to use inside SimplyCPF.",
  alternates: {
    canonical: "/retirement-readiness",
  },
};

const schema: Graph = buildGraph([
  buildPageSchema({
    name: "Retirement Readiness Score",
    description:
      "Answer 5 quick questions to estimate how prepared your CPF planning is and which SimplyCPF tool to use next.",
    url: `${BASE_URL}/retirement-readiness`,
    speakableSelectors: ["h1", "[data-readiness-intro]"],
  }),
  pageBreadcrumb(
    "Retirement Readiness Score",
    `${BASE_URL}/retirement-readiness`,
  ),
]);

export default function RetirementReadinessPage() {
  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-6">
        <header className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-bold text-[30px] text-foreground tracking-tight md:text-[34px]">
            Retirement Readiness Overview
          </h1>
          <p
            data-readiness-intro
            className="max-w-2xl text-[14px] text-muted-foreground"
          >
            This page summarises your current retirement readiness inputs and
            highlights areas for follow-up review.
          </p>
        </header>
        <ReadinessScoreForm />
      </div>
    </>
  );
}
