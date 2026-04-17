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
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-3xl text-foreground tracking-tight md:text-4xl">
            How Ready Is Your CPF Plan?
          </h1>
          <p
            data-readiness-intro
            className="mx-auto max-w-3xl text-muted-foreground"
          >
            This 5-question score is meant to surface the next CPF planning gap
            worth fixing. It is not a guarantee of retirement adequacy. It is a
            faster way to decide whether you should use the projection tool, the
            CPF LIFE estimator, or the calculator next.
          </p>
        </div>
        <ReadinessScoreForm />
      </div>
    </>
  );
}
