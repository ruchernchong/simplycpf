import { Accordion, buttonVariants, Card, Typography } from "@heroui/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Graph } from "schema-dts";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, WEBSITE_ID } from "@/config";
import { faqData } from "@/data/cpf-faqs";
import { cn } from "@/lib/utils";
import { CPF_POLICY_CATALOGUE } from "@/policy";

const retirementAge =
  CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;
const firstSchedule = CPF_POLICY_CATALOGUE.contributionSchedules.at(0);
const latestSchedule = CPF_POLICY_CATALOGUE.contributionSchedules.at(-1);

export const metadata: Metadata = {
  title: "About SimplyCPF: Free Singapore CPF Contribution Calculator",
  description:
    "About SimplyCPF, a free, open-source CPF contribution calculator for Singapore employees and employers. Learn how SimplyCPF calculates CPF contributions by age group, tracks income ceiling changes, and helps you plan your retirement savings.",
  keywords:
    "About SimplyCPF, CPF calculator Singapore, CPF contribution accuracy, CPF age groups, CPF income ceiling, Singapore CPF contribution rates, how CPF is calculated, CPF FAQ",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About SimplyCPF: Free Singapore CPF Contribution Calculator",
    description:
      "Learn about SimplyCPF, the free, open-source CPF contribution calculator for Singapore employees and employers.",
    url: `${BASE_URL}/about`,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "About SimplyCPF: Free CPF Contribution Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About SimplyCPF: Free Singapore CPF Contribution Calculator",
    description:
      "Learn about SimplyCPF, the free, open-source CPF contribution calculator for Singapore employees and employers.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

export default function About() {
  const schema: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/about/#webpage`,
        name: "About SimplyCPF",
        description:
          "About SimplyCPF, a free, open-source CPF contribution calculator for Singapore employees and employers, with frequently asked questions about CPF contributions, income ceiling changes, and account distributions.",
        url: `${BASE_URL}/about`,
        inLanguage: "en-SG",
        dateModified:
          CPF_POLICY_CATALOGUE.metadata["cpf-contribution-rates"].verifiedAt,
        isPartOf: { "@id": WEBSITE_ID },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "[data-content-block='faq']"],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "About",
            item: `${BASE_URL}/about`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqData.map(({ question, answer }) => ({
          "@type": "Question" as const,
          name: question,
          acceptedAnswer: { "@type": "Answer" as const, text: answer },
        })),
      },
    ],
  };

  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-8 p-6">
        <Card>
          <Card.Header>
            <Card.Title>About SimplyCPF</Card.Title>
            <Card.Description>
              No guesswork. The core tools stay free with no sign-up required.
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            <Typography>
              SimplyCPF is a free, open-source tool that helps Singapore
              Citizens and Permanent Residents see exactly where their CPF
              contributions go, based on contribution month, wages, age and
              citizenship status. The main calculators and planning tools work
              without sign-up.
            </Typography>
            <Typography>
              Contribution and allocation schedules vary by age, wage band,
              effective month and citizenship status. From age {retirementAge},
              the retirement share may go to RA or OA depending on whether the
              Full Retirement Sum has been set aside, so SimplyCPF exposes both
              official branches when account context is unavailable.
            </Typography>
            <Typography>
              All calculation logic is open-source and verifiable on GitHub. The
              versioned policy catalogue links every official dataset to CPF
              Board, IRAS or MOM and records its effective and verification
              dates. SimplyCPF assumptions are labelled separately.
            </Typography>
            <Typography>
              This tool covers published CPF contribution and ceiling schedules
              from {firstSchedule?.effectiveFrom} through{" "}
              {latestSchedule?.effectiveTo}. Its contribution scope is
              private-sector and non-pensionable employees who are Singapore
              Citizens or SPRs using default G/G rates. Platform workers,
              self-employed persons, pensionable employees and alternative SPR
              arrangements remain out of scope.
            </Typography>
          </Card.Content>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <Card.Header>
            <Card.Title>Important Disclaimer</Card.Title>
          </Card.Header>
          <Card.Content>
            <Typography className="mb-4">
              This calculator is an independent tool to help with CPF
              contribution calculations. It is not affiliated with, endorsed by,
              or connected to the Central Provident Fund Board (CPF Board),
              Ministry of Manpower (MOM), or any government agency.
            </Typography>
            <Typography>
              All rates are sourced from CPF Board publications and the
              calculation logic is open for anyone to verify. For official CPF
              matters, always refer to the{" "}
              <a
                href="https://www.cpf.gov.sg"
                className="text-accent underline underline-offset-2 hover:text-accent/80"
                target="_blank"
                rel="noopener noreferrer"
              >
                CPF Board website
              </a>{" "}
              or contact CPF Board directly.
            </Typography>
          </Card.Content>
        </Card>

        <Card data-content-block="faq">
          <Card.Header>
            <Card.Title>Frequently Asked Questions</Card.Title>
            <Card.Description>
              Common questions about CPF contributions and this calculator
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <Accordion className="w-full" variant="surface">
              {faqData.map(({ question, answer }) => {
                const index = `${question}-${answer}`;
                return (
                  <Accordion.Item key={index} id={`item-${index}`}>
                    <Accordion.Heading>
                      <Accordion.Trigger className="text-left">
                        {question}
                        <Accordion.Indicator />
                      </Accordion.Trigger>
                    </Accordion.Heading>
                    <Accordion.Panel>
                      <Accordion.Body>{answer}</Accordion.Body>
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </Card.Content>
        </Card>

        <div className="text-center">
          <Typography className="mb-4" type="h5" weight="medium">
            Try the calculator. Free, instant, no sign-up required
          </Typography>
          <Link
            href="/calculator"
            className={cn(buttonVariants({ size: "lg" }), "gap-2")}
          >
            Calculate My CPF
            <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
