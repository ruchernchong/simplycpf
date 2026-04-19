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

const PRIVACY_DESCRIPTION =
  "SimplyCPF works without signing up. No account, no email, no backend database. Only anonymous usage analytics and a theme preference cookie.";

export const metadata: Metadata = {
  title: "Privacy | SimplyCPF",
  description: PRIVACY_DESCRIPTION,
  alternates: {
    canonical: "/privacy",
  },
};

const schema: Graph = buildGraph([
  buildPageSchema({
    name: "Privacy",
    description: PRIVACY_DESCRIPTION,
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
            SimplyCPF works without sign-up. There is no account to create, no
            email address to hand over, and no backend database holding your
            calculator inputs.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What stays in your browser</CardTitle>
            <CardDescription>
              Calculator inputs never leave your device
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-muted-foreground">
            <p>
              Salary, age, citizenship, and other inputs you enter into the
              calculator, projection, what-if, and CPF LIFE tools are held in
              memory on your device and, where relevant, serialised into the
              URL so you can share or reopen a scenario.
            </p>
            <p>
              These values are not transmitted to a SimplyCPF backend because
              there is no backend database. The CPF calculations run in your
              browser.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anonymous usage analytics</CardTitle>
            <CardDescription>PostHog, routed through a first-party proxy</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-muted-foreground">
            <p>
              SimplyCPF uses PostHog to understand how the tools are used in
              aggregate. It captures anonymous events such as page views,
              interactions, and errors. Requests are routed through a
              first-party <code>/ph</code> proxy.
            </p>
            <p>
              Calculator inputs, email addresses, and personal identifiers are
              not attached to these events. PostHog may set its own cookies or
              local storage entries for session analytics.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookies</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-muted-foreground">
            <p>
              A theme preference cookie is set so that your light or dark mode
              choice persists between visits.
            </p>
            <p>
              Beyond that and the PostHog entries noted above, SimplyCPF does
              not set cookies of its own.
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
              We do not require sign-up to use the CPF calculators and planning
              tools.
            </p>
            <p>
              We do not send marketing emails or newsletters, and there is no
              email collection flow on the site.
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
