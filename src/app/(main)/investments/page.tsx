import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Graph } from "schema-dts";
import { CPFInvestmentComparison } from "@/components/investments/cpf-investment-comparison";
import { StructuredData } from "@/components/seo/structured-data";
import { buttonVariants } from "@/components/ui/button";
import { BASE_URL } from "@/config";
import {
  buildBreadcrumbList,
  buildGraph,
  buildPageSchema,
  buildSpeakable,
} from "@/lib/build-schema";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "CPF vs Other Investments | Compare Your CPF Returns Side by Side",
  description:
    "Is keeping money in CPF your best move? Compare CPF account growth against Singapore Government bonds, STI ETF, global equity, and more. Adjust time horizons and principal amounts to see how different strategies stack up.",
  keywords:
    "CPF investment, CPF investment scheme, CPFIS, CPF vs investment, CPF returns comparison, CPF OA returns, CPF SA returns, STI ETF vs CPF, Singapore investment comparison, CPF growth calculator",
  alternates: {
    canonical: "/investments",
  },
  openGraph: {
    title: "CPF vs Other Investments | Compare Your CPF Returns Side by Side",
    description:
      "Compare CPF account growth against Singapore bonds, STI ETF, and other investments. Adjust time horizons and see side-by-side returns.",
    url: `${BASE_URL}/investments`,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "CPF vs Other Investments — SimplyCPF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF vs Other Investments | Compare Your CPF Returns Side by Side",
    description:
      "Compare CPF account growth against Singapore bonds, STI ETF, and other investments. Adjust time horizons and see side-by-side returns.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

const InvestmentsPage = () => {
  const schema: Graph = buildGraph([
    buildPageSchema({
      name: "CPF Investment Comparison",
      description:
        "Compare CPF account growth against Singapore bonds, STI ETF, and other investment options. Adjust time horizons and see side-by-side returns over time.",
      url: `${BASE_URL}/investments`,
      speakableSelectors: ["h1", ".investment-description"],
      keywords:
        "CPF investment, CPF investment scheme, CPFIS, CPF vs investment, CPF returns comparison, STI ETF vs CPF, Singapore investment comparison",
    }),
    buildBreadcrumbList([
      { name: "Home", url: BASE_URL },
      { name: "Investments", url: `${BASE_URL}/investments` },
    ]),
    buildSpeakable(["h1"]),
  ]);

  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-6">
        <header className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-bold text-[30px] text-foreground tracking-tight md:text-[34px]">
            Investment Growth Comparison
          </h1>
          <p className="investment-description max-w-3xl text-[14px] text-muted-foreground leading-[1.55]">
            Compare projected balances across CPF accounts, SGS bonds, STI ETF,
            and global equity ETFs using the same starting amount, period, and
            monthly top-up assumptions.
          </p>
        </header>
        <CPFInvestmentComparison />
        <div className="flex flex-col items-center gap-3 pb-2 text-center">
          <p className="text-[13px] text-muted-foreground">
            Review your CPF contribution estimate before comparing investment
            outcomes.
          </p>
          <Link
            href="/calculator"
            className={cn(buttonVariants({ size: "sm" }), "gap-2")}
          >
            Open CPF Calculator
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              className="size-4"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </>
  );
};

export default InvestmentsPage;
