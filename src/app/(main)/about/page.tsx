import { Accordion, buttonVariants, Card } from "@heroui/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Graph } from "schema-dts";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, OG_BASE, OG_IMAGE, WEBSITE_ID } from "@/config";
import faqData from "@/data/faq.json";
import { cn } from "@/lib/utils";

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
    ...OG_BASE,
    description:
      "Learn about SimplyCPF, the free, open-source CPF contribution calculator for Singapore employees and employers.",
    url: `${BASE_URL}/about`,
    images: [
      { ...OG_IMAGE, alt: "About SimplyCPF: Free CPF Contribution Calculator" },
    ],
  },
};

const About = () => {
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
              No guesswork. The core tools stay free and sign-up is optional.
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            <p>
              SimplyCPF is a free, open-source tool that helps Singapore
              Citizens and Permanent Residents see exactly where their CPF
              retirement money goes, based on income, age group, and the latest
              ceiling changes. The main calculators and planning tools work
              without sign-up.
            </p>
            <p>
              CPF contribution rates vary across 8 age brackets, and
              contributions are distributed differently across your Ordinary
              Account (OA), Special Account (SA), and MediSave Account (MA)
              depending on your age. SimplyCPF handles all of this automatically
              so you get the numbers that matter: your take-home pay and
              retirement savings, without cross-referencing government tables.
            </p>
            <p>
              All calculation logic is open-source and verifiable on GitHub.
              Rates are sourced directly from CPF Board publications and updated
              within days when changes are announced.
            </p>
            <p>
              If you ask SimplyCPF to email you a CPF cheat sheet or readiness
              report, we only use your email address to send that requested
              resource. You can read the current disclosure on the{" "}
              <Link
                href="/privacy"
                className="text-accent underline underline-offset-2 hover:text-accent/80"
              >
                privacy page
              </Link>
              .
            </p>
            <p>
              This tool covers the progressive increases in CPF Income Ceiling
              from 2023 to 2026 following Budget 2023, so you can see exactly
              how much more of your income becomes retirement savings over time.
              Whether you are an employee estimating your take-home pay, an
              employer verifying contribution amounts, or a financial planner
              comparing CPF growth with other investments: SimplyCPF gives you
              the numbers in seconds.
            </p>
          </Card.Content>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <Card.Header>
            <Card.Title>Important Disclaimer</Card.Title>
          </Card.Header>
          <Card.Content>
            <p className="mb-4">
              This calculator is an independent tool to help with CPF
              contribution calculations. It is not affiliated with, endorsed by,
              or connected to the Central Provident Fund Board (CPF Board),
              Ministry of Manpower (MOM), or any government agency.
            </p>
            <p>
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
            </p>
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
          <p className="mb-4 font-medium text-foreground text-lg">
            Try the calculator. Free, instant, no sign-up required
          </p>
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
};

export default About;
