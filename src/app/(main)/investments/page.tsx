import { buttonVariants } from "@heroui/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Graph } from "schema-dts";
import { CPFInvestmentComparison } from "@/components/investments/cpf-investment-comparison";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, OG_BASE, OG_IMAGE, WEBSITE_ID } from "@/config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "CPF vs Other Investments: Compare Your CPF Returns Side by Side",
  description:
    "Is keeping money in CPF your best move? Compare CPF account growth against Singapore Government bonds, STI ETF, global equity, and more. Adjust time horizons and principal amounts to see how different strategies stack up.",
  keywords:
    "CPF investment, CPF investment scheme, CPFIS, CPF vs investment, CPF returns comparison, CPF OA returns, CPF SA returns, STI ETF vs CPF, Singapore investment comparison, CPF growth calculator",
  alternates: {
    canonical: "/investments",
  },
  openGraph: {
    ...OG_BASE,
    description:
      "Compare CPF account growth against Singapore bonds, STI ETF, and other investments. Adjust time horizons and see side-by-side returns.",
    url: `${BASE_URL}/investments`,
    images: [{ ...OG_IMAGE, alt: "CPF vs Other Investments, SimplyCPF" }],
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
          "Compare CPF account growth against Singapore bonds, STI ETF, and other investment options. Adjust time horizons and see side-by-side returns over time.",
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
          <h1 className="mb-4 font-bold text-3xl text-foreground tracking-tight md:text-4xl">
            Is Keeping Money in CPF Your Best Move?
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            CPF accounts offer guaranteed returns backed by the Singapore
            Government, but they are not your only option. Compare CPF growth
            against Singapore Government bonds, the STI ETF, or global equity
            ETFs. Adjust the initial amount and investment period to see how
            each strategy performs side by side, so you can decide what best
            fits your retirement timeline.
          </p>
        </div>
        <CPFInvestmentComparison />
        <div className="text-center">
          <p className="mb-4 font-medium text-foreground text-lg">
            Haven&apos;t calculated your CPF contributions yet?
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

export default InvestmentsPage;
