import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import { StructuredData } from "@/components/seo/structured-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BASE_URL } from "@/config";
import {
  buildGraph,
  buildPageSchema,
  pageBreadcrumb,
} from "@/lib/build-schema";

export const metadata: Metadata = {
  title: "Privacy | SimplyCPF",
  description:
    "Privacy information for SimplyCPF, including how optional email delivery works for CPF cheat sheets and readiness reports.",
  alternates: {
    canonical: "/privacy",
  },
};

const schema: Graph = buildGraph([
  buildPageSchema({
    name: "Privacy",
    description:
      "Privacy information for SimplyCPF, including how optional email delivery works for CPF cheat sheets and readiness reports.",
    url: `${BASE_URL}/privacy`,
    speakableSelectors: ["h1", "[data-privacy-summary]"],
  }),
  pageBreadcrumb("Privacy", `${BASE_URL}/privacy`),
]);

export default function PrivacyPage() {
  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-3xl text-foreground tracking-tight md:text-4xl">
            Privacy
          </h1>
          <p
            data-privacy-summary
            className="mx-auto max-w-3xl text-muted-foreground"
          >
            The core SimplyCPF tools work without sign-up. Email is only used if
            you ask us to send you a CPF cheat sheet or a retirement readiness
            report.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What we collect</CardTitle>
            <CardDescription>
              Only when you request a resource by email
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-muted-foreground">
            <p>
              If you use the calculator, projection tools, what-if simulator, or
              CPF LIFE estimator without asking for email delivery, SimplyCPF
              does not require an account or collect your email address.
            </p>
            <p>
              If you ask us to send you a CPF cheat sheet or readiness report,
              we store the email address you submit together with basic context
              about the request, such as the page you came from and optional
              campaign parameters.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How email delivery works</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-muted-foreground">
            <p>
              Email delivery is handled through Resend. We use it to send the
              specific resource or report you requested.
            </p>
            <p>
              These emails are transactional. They exist to deliver the CPF
              resource you asked for, not to lock the core product behind
              sign-up.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What we do not do</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-muted-foreground">
            <p>We do not sell your personal data.</p>
            <p>
              We do not require sign-up to use the main CPF calculators and
              planning tools.
            </p>
            <p>
              We do not claim to replace the official CPF Board website for
              formal account actions or government services.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
