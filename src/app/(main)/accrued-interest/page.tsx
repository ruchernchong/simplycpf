import type { Metadata } from "next";
import { Suspense } from "react";
import type { Graph } from "schema-dts";
import { AccruedInterestContent } from "@/components/housing/accrued-interest-content";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, OG_BASE, WEBSITE_ID } from "@/config";

const PAGE_URL = `${BASE_URL}/accrued-interest`;
const title = "CPF accrued interest on your home, explained";
const description =
  "OA money used for a home keeps a running 2.5% tab. See how much accrued interest builds up and how much returns to CPF when you sell.";

export const metadata: Metadata = {
  title,
  description,
  keywords:
    "CPF accrued interest, CPF accrued interest calculator, OA used for property, CPF refund on sale, using CPF for housing",
  alternates: {
    canonical: "/accrued-interest",
  },
  openGraph: {
    ...OG_BASE,
    url: PAGE_URL,
  },
};

const schema: Graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}/#webpage`,
      name: "CPF accrued interest on your home",
      description,
      url: PAGE_URL,
      inLanguage: "en-SG",
      isPartOf: { "@id": WEBSITE_ID },
      keywords:
        "CPF accrued interest, OA used for property, CPF refund on sale, housing withdrawal",
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1"] },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Accrued interest",
          item: PAGE_URL,
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      name: "SimplyCPF Accrued Interest Illustration",
      url: PAGE_URL,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "SGD" },
      featureList: [
        "Illustrate accrued interest on OA used for a home",
        "See the cumulative interest year by year",
        "See how much of a sale returns to CPF before any cash",
      ],
    },
  ],
};

export default function AccruedInterestPage() {
  return (
    <>
      <StructuredData data={schema} />
      <header className="flex flex-col gap-2">
        <span className="font-mono text-[10.5px] text-muted uppercase tracking-[0.13em]">
          Home &amp; OA
        </span>
        <h1 className="text-balance font-semibold text-4xl tracking-tight">
          Accrued interest, without the forum arguments
        </h1>
        <p className="max-w-[76ch] text-pretty text-base text-muted leading-relaxed">
          OA money you put into a home keeps a running 2.5% tab: the interest it
          would have earned had it stayed. When you sell, the principal plus
          that accrued interest returns to your CPF before you see any cash. It
          is a refund to yourself, not a penalty, but it changes what a sale
          actually pays out.
        </p>
      </header>
      <Suspense>
        <AccruedInterestContent />
      </Suspense>
    </>
  );
}
