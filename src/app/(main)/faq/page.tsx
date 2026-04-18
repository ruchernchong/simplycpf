import type { Metadata } from "next";
import Link from "next/link";
import type { Graph } from "schema-dts";
import { StructuredData } from "@/components/seo/structured-data";
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
import faqCalculatorData from "@/data/faq-calculator.json";
import faqCpfLifeData from "@/data/faq-cpf-life.json";
import faqProjectionData from "@/data/faq-projection.json";
import {
  buildBreadcrumbList,
  buildFAQPage,
  buildGraph,
  buildPageSchema,
} from "@/lib/build-schema";

export const metadata: Metadata = {
  title: "CPF FAQ — Common Questions Answered",
  description:
    "Find answers to frequently asked questions about CPF contributions, career projections, CPF LIFE, and retirement planning in Singapore.",
  keywords:
    "CPF FAQ, CPF questions, CPF answers, Singapore CPF help, CPF calculator FAQ, CPF contribution FAQ, CPF LIFE FAQ, CPF retirement planning",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "CPF FAQ — Common Questions Answered",
    description:
      "Find answers to frequently asked questions about CPF contributions, career projections, CPF LIFE, and retirement planning in Singapore.",
    url: `${BASE_URL}/faq`,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "CPF FAQ — Common Questions Answered",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF FAQ — Common Questions Answered",
    description:
      "Find answers to frequently asked questions about CPF contributions, career projections, CPF LIFE, and retirement planning in Singapore.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

const FAQIndex = () => {
  // Combine all FAQ data for the schema
  const allFaqs = [
    ...faqData,
    ...faqCalculatorData,
    ...faqProjectionData,
    ...faqCpfLifeData,
  ];

  const schema: Graph = buildGraph([
    buildPageSchema({
      name: "CPF FAQ — Common Questions Answered",
      description:
        "Find answers to frequently asked questions about CPF contributions, career projections, CPF LIFE, and retirement planning in Singapore.",
      url: `${BASE_URL}/faq`,
    }),
    buildBreadcrumbList([
      { name: "Home", url: BASE_URL },
      { name: "FAQ", url: `${BASE_URL}/faq` },
    ]),
    buildFAQPage(allFaqs),
  ]);

  const categories = [
    {
      title: "General CPF Questions",
      description: `Essential CPF concepts, interest rates, and how SimplyCPF works (${faqData.length} questions)`,
      href: "/faq/general",
      count: faqData.length,
    },
    {
      title: "Contribution Rates",
      description: `CPF contribution calculations, income ceilings, and age-based rates (${faqCalculatorData.length} questions)`,
      href: "/faq/contribution-rates",
      count: faqCalculatorData.length,
    },
    {
      title: "Career Projection",
      description: `Long-term CPF balance projections, milestones, and interest (${faqProjectionData.length} questions)`,
      href: "/faq/projection",
      count: faqProjectionData.length,
    },
    {
      title: "CPF LIFE",
      description: `Monthly payouts, plan types, and retirement income (${faqCpfLifeData.length} questions)`,
      href: "/faq/cpf-life",
      count: faqCpfLifeData.length,
    },
  ];

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
              <BreadcrumbPage>FAQ</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card>
          <CardHeader>
            <CardTitle>CPF FAQ</CardTitle>
            <CardDescription>
              Common questions answered about CPF contributions, projections,
              CPF LIFE, and retirement planning in Singapore
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {categories.map((category) => (
                <Link
                  key={category.href}
                  href={
                    category.href as
                      | "/faq/general"
                      | "/faq/contribution-rates"
                      | "/faq/projection"
                      | "/faq/cpf-life"
                  }
                  className="group"
                >
                  <Card className="h-full transition-colors hover:border-accent">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg">
                        {category.title}
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 font-medium text-accent text-xs">
                          {category.count}
                        </span>
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default FAQIndex;
