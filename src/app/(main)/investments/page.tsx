import { buttonVariants, Typography } from "@heroui/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Graph } from "schema-dts";
import { CPFInvestmentComparison } from "@/components/investments/cpf-investment-comparison";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, WEBSITE_ID } from "@/config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "CPF Growth vs Your Investment Assumptions",
  description:
    "Compare official CPF floor-rate presets with annual return assumptions you enter yourself. Non-CPF returns are illustrations, not CPF Board facts or forecasts.",
  keywords:
    "CPF investment, CPF investment scheme, CPFIS, CPF vs investment, CPF returns comparison, CPF OA returns, CPF SA returns, STI ETF vs CPF, Singapore investment comparison, CPF growth calculator",
  alternates: {
    canonical: "/investments",
  },
  openGraph: {
    title: "CPF Growth vs Your Investment Assumptions",
    description:
      "Compare official CPF floor rates with editable, user-supplied non-CPF return assumptions.",
    url: `${BASE_URL}/investments`,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "CPF growth and editable investment assumptions, SimplyCPF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF Growth vs Your Investment Assumptions",
    description:
      "Compare official CPF floor rates with editable, user-supplied non-CPF return assumptions.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

const InvestmentsPage = () => {
  const schema: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/investments/#webpage`,
        name: "CPF Investment Comparison",
        description:
          "Compare CPF account growth at official floor rates with editable user assumptions for non-CPF investments.",
        url: `${BASE_URL}/investments`,
        inLanguage: "en-SG",
        isPartOf: { "@id": WEBSITE_ID },
        keywords:
          "CPF investment, CPF investment scheme, CPFIS, CPF vs investment, CPF returns comparison, STI ETF vs CPF, Singapore investment comparison",
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", ".investment-description"],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Investments",
            item: `${BASE_URL}/investments`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <Typography align="center" className="mb-4" type="h1">
            Compare CPF With Your Own Return Assumptions
          </Typography>
          <Typography
            align="center"
            className="mx-auto max-w-2xl"
            color="muted"
          >
            The CPF presets use published OA and SMRA floor rates. For every
            non-CPF option, enter the annual return you want to illustrate.
            Those rates are your assumptions, before fees, tax, and volatility;
            SimplyCPF does not present market-return forecasts as CPF facts.
          </Typography>
        </div>
        <CPFInvestmentComparison />
        <div className="text-center">
          <Typography className="mb-4" type="h5" weight="medium">
            Haven&apos;t calculated your CPF contributions yet?
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
};

export default InvestmentsPage;
