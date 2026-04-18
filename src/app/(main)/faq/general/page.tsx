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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BASE_URL } from "@/config";
import faqData from "@/data/faq.json";
import {
  buildBreadcrumbList,
  buildFAQPage,
  buildGraph,
  buildPageSchema,
} from "@/lib/build-schema";

export const metadata: Metadata = {
  title: "General CPF FAQ",
  description:
    "Find answers to general CPF questions about interest rates, account types, data privacy, and how SimplyCPF works.",
  keywords:
    "CPF general FAQ, CPF interest rates, OA SA MA, CPF data privacy, SimplyCPF questions",
  alternates: {
    canonical: "/faq/general",
  },
  openGraph: {
    title: "General CPF FAQ",
    description:
      "Find answers to general CPF questions about interest rates, account types, data privacy, and how SimplyCPF works.",
    url: `${BASE_URL}/faq/general`,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "General CPF FAQ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "General CPF FAQ",
    description:
      "Find answers to general CPF questions about interest rates, account types, data privacy, and how SimplyCPF works.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

const GeneralFAQ = () => {
  const schema: Graph = buildGraph([
    buildPageSchema({
      name: "General CPF FAQ",
      description:
        "Find answers to general CPF questions about interest rates, account types, data privacy, and how SimplyCPF works.",
      url: `${BASE_URL}/faq/general`,
      speakableSelectors: ["h1", "[data-content-block='faq']"],
    }),
    buildBreadcrumbList([
      { name: "Home", url: BASE_URL },
      { name: "FAQ", url: `${BASE_URL}/faq` },
      { name: "General", url: `${BASE_URL}/faq/general` },
    ]),
    buildFAQPage(faqData),
  ]);

  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-6 p-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/faq" />}>FAQ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>General</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card
          data-content-block="faq"
          itemScope
          itemProp="mainEntity"
          itemType="https://schema.org/FAQPage"
        >
          <CardHeader>
            <CardTitle>General CPF Questions</CardTitle>
            <CardDescription>
              Essential CPF concepts, interest rates, account types, and how
              SimplyCPF works
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
      </div>
    </>
  );
};

export default GeneralFAQ;
