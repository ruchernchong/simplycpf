import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Graph } from "schema-dts";
import HeroSection from "@/components/home/hero-section";
import InsightBanner from "@/components/home/insight-banner";
import QuickActions from "@/components/home/quick-actions";
import CpfDefinitionBlock from "@/components/seo/cpf-definition-block";
import CpfStatisticBlock from "@/components/seo/cpf-statistic-block";
import { StructuredData } from "@/components/seo/structured-data";
import CPFIncomeCeilingTimeline from "@/components/timeline/cpf-income-ceiling-timeline";
import { buttonVariants } from "@/components/ui/button";
import { BASE_URL } from "@/config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "SimplyCPF — Free CPF Contribution Calculator for Singapore",
  description:
    "Free CPF contribution calculator for Singapore employees and employers. Calculate CPF contributions by age group, track income ceiling changes from 2023 to 2026, and see distribution across OA, SA, and MA accounts.",
  keywords:
    "CPF contribution calculator, CPF calculator Singapore, CPF income ceiling, CPF ceiling change, CPF ceiling timeline, CPF $6000 to $8000, Budget 2023 CPF, progressive ceiling, Singapore CPF, take-home pay CPF",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SimplyCPF — Free CPF Contribution Calculator for Singapore",
    description:
      "Free CPF contribution calculator for Singapore employees and employers. Calculate CPF contributions by age group, track income ceiling changes from 2023 to 2026, and see distribution across OA, SA, and MA accounts.",
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "SimplyCPF — Free CPF Contribution Calculator for Singapore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SimplyCPF — Free CPF Contribution Calculator for Singapore",
    description:
      "Free CPF contribution calculator for Singapore employees and employers. Calculate CPF contributions by age group, track income ceiling changes from 2023 to 2026, and see distribution across OA, SA, and MA accounts.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

const HomePage = () => {
  const schema: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "SimplyCPF",
        description:
          "Free CPF contribution calculator for Singapore employees and employers. Calculate contributions by age group, track progressive ceiling changes, and view OA, SA, MA distribution.",
        url: BASE_URL,
        applicationCategory: "FinanceApplication",
        featureList: [
          "Calculate CPF contributions by age group and income",
          "View distribution across OA, SA, MA accounts",
          "Track progressive income ceiling changes from 2023 to 2026",
          "Compare CPF returns against investment options",
          "Access current CPF interest rates and distribution rates",
        ],
        inLanguage: "en-SG",
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
        ],
      },
    ],
  };

  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-6">
        <HeroSection />
        <div className="grid gap-6 md:grid-cols-2">
          <CPFIncomeCeilingTimeline />
          <div className="flex flex-col gap-6">
            <InsightBanner />
            <QuickActions />
          </div>
        </div>
        <CpfDefinitionBlock />
        <CpfStatisticBlock />
        <div className="text-center">
          <p className="mb-4 font-medium text-foreground text-lg">
            Ready to see your CPF breakdown?
          </p>
          <Link
            href="/calculator"
            className={cn(buttonVariants({ size: "lg" }), "gap-2")}
          >
            Calculate My CPF Now
            <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" />
          </Link>
        </div>
      </div>
    </>
  );
};

export default HomePage;
