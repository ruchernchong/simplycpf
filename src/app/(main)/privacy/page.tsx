import { Card, Typography } from "@heroui/react";
import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, OG_IMAGE, WEBSITE_ID } from "@/config";

const PRIVACY_DESCRIPTION =
  "SimplyCPF works without signing up. No account, no email, no backend database. Only anonymous usage analytics and a theme preference cookie.";

const PAGE_URL = `${BASE_URL}/privacy`;

export const metadata: Metadata = {
  title: "Privacy",
  description: PRIVACY_DESCRIPTION,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy",
    description: PRIVACY_DESCRIPTION,
    url: PAGE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy",
    description: PRIVACY_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

const schema: Graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}/#webpage`,
      name: "Privacy",
      description: PRIVACY_DESCRIPTION,
      url: PAGE_URL,
      inLanguage: "en-SG",
      isPartOf: { "@id": WEBSITE_ID },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "[data-privacy-summary]"],
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Privacy", item: PAGE_URL },
      ],
    },
  ],
};

export default function PrivacyPage() {
  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <Typography align="center" className="mb-4" type="h1">
            Privacy
          </Typography>
          <Typography
            align="center"
            color="muted"
            data-privacy-summary
            className="mx-auto max-w-3xl"
          >
            SimplyCPF works without sign-up. There is no account to create, no
            email address to hand over, and no backend database holding your
            calculator inputs.
          </Typography>
        </div>

        <Card>
          <Card.Header>
            <Card.Title>What stays in your browser</Card.Title>
            <Card.Description>
              Calculator inputs never leave your device
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            <Typography color="muted">
              Salary, age, citizenship, and other inputs you enter into the
              calculator, projection, what-if, and CPF LIFE tools are held in
              memory on your device and, where relevant, serialised into the URL
              so you can share or reopen a scenario.
            </Typography>
            <Typography color="muted">
              These values are not transmitted to a SimplyCPF backend because
              there is no backend database. The CPF calculations run in your
              browser.
            </Typography>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Anonymous usage analytics</Card.Title>
            <Card.Description>
              PostHog, routed through a first-party proxy
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            <Typography color="muted">
              SimplyCPF uses PostHog to understand how the tools are used in
              aggregate. It captures anonymous events such as page views,
              interactions, and errors. Requests are routed through a
              first-party <code>/ph</code> proxy.
            </Typography>
            <Typography color="muted">
              Calculator inputs, email addresses, and personal identifiers are
              not attached to these events. PostHog may set its own cookies or
              local storage entries for session analytics.
            </Typography>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Cookies</Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            <Typography color="muted">
              A theme preference cookie is set so that your light or dark mode
              choice persists between visits.
            </Typography>
            <Typography color="muted">
              Beyond that and the PostHog entries noted above, SimplyCPF does
              not set cookies of its own.
            </Typography>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>What we do not do</Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            <Typography color="muted">
              We do not sell your personal data.
            </Typography>
            <Typography color="muted">
              We do not require sign-up to use the CPF calculators and planning
              tools.
            </Typography>
            <Typography color="muted">
              We do not send marketing emails or newsletters, and there is no
              email collection flow on the site.
            </Typography>
            <Typography color="muted">
              We do not claim to replace the official CPF Board website for
              formal account actions or government services.
            </Typography>
          </Card.Content>
        </Card>
      </div>
    </>
  );
}
