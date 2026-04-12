import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Graph } from "schema-dts";
import { StructuredData } from "@/components/seo/structured-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BASE_URL } from "@/config";
import faqData from "@/data/faq.json";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About SimplyCPF | Free Singapore CPF Contribution Calculator",
  description:
    "About SimplyCPF — a free, open-source CPF contribution calculator for Singapore employees and employers. Learn how SimplyCPF calculates CPF contributions by age group, tracks income ceiling changes, and helps you plan your retirement savings.",
  keywords:
    "About SimplyCPF, CPF calculator Singapore, CPF contribution accuracy, CPF age groups, CPF income ceiling, Singapore CPF contribution rates, how CPF is calculated, CPF FAQ",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About SimplyCPF | Free Singapore CPF Contribution Calculator",
    description:
      "Learn about SimplyCPF — the free, open-source CPF contribution calculator for Singapore employees and employers.",
    url: `${BASE_URL}/about`,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "About SimplyCPF — Free CPF Contribution Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About SimplyCPF | Free Singapore CPF Contribution Calculator",
    description:
      "Learn about SimplyCPF — the free, open-source CPF contribution calculator for Singapore employees and employers.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

const About = () => {
  const schema: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        name: "About SimplyCPF",
        description:
          "About SimplyCPF — a free, open-source CPF contribution calculator for Singapore employees and employers, with frequently asked questions about CPF contributions, income ceiling changes, and account distributions.",
        url: `${BASE_URL}/about`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: BASE_URL,
          },
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
          "@type": "Question",
          name: question,
          acceptedAnswer: {
            "@type": "Answer",
            text: answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-8 p-6">
        <Card>
          <CardHeader>
            <CardTitle>About SimplyCPF</CardTitle>
            <CardDescription>
              No guesswork, no sign-up, no data collection
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p>
              SimplyCPF is a free, open-source tool that helps Singapore
              Citizens and Permanent Residents see exactly where their CPF
              retirement money goes — based on income, age group, and the latest
              ceiling changes. No sign-up, no data collection.
            </p>
            <p>
              CPF contribution rates vary across 8 age brackets, and
              contributions are distributed differently across your Ordinary
              Account (OA), Special Account (SA), and MediSave Account (MA)
              depending on your age. SimplyCPF handles all of this automatically
              so you get the numbers that matter — your take-home pay and
              retirement savings — without cross-referencing government tables.
            </p>
            <p>
              All calculation logic is open-source and verifiable on GitHub.
              Rates are sourced directly from CPF Board publications and updated
              within days when changes are announced.
            </p>
            <p>
              This tool covers the progressive increases in CPF Income Ceiling
              from 2023 to 2026 following Budget 2023, so you can see exactly
              how much more of your income becomes retirement savings over time.
              Whether you are an employee estimating your take-home pay, an
              employer verifying contribution amounts, or a financial planner
              comparing CPF growth with other investments — SimplyCPF gives you
              the numbers in seconds.
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle>Important Disclaimer</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card
          data-content-block="faq"
          itemScope
          itemProp="mainEntity"
          itemType="https://schema.org/FAQPage"
        >
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Common questions about CPF contributions and this calculator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion className="w-full">
              {faqData.map(({ question, answer }) => {
                const index = `${question}-${answer}`;
                return (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    itemScope
                    itemProp="mainEntity"
                    itemType="https://schema.org/Question"
                  >
                    <AccordionTrigger className="text-left">
                      <span itemProp="name">{question}</span>
                    </AccordionTrigger>
                    <AccordionContent
                      className="text-muted-foreground"
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                    >
                      <span itemProp="text">{answer}</span>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="mb-4 font-medium text-foreground text-lg">
            Try the calculator — free, instant, no sign-up
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
