import type { Metadata } from "next";
import { Suspense } from "react";
import type { Graph } from "schema-dts";
import { AccruedInterestContent } from "@/components/housing/accrued-interest-content";
import { StructuredData } from "@/components/seo/structured-data";
import { PageHeader } from "@/components/shared/section-header";
import { BASE_URL, OG_IMAGE, WEBSITE_ID } from "@/config";

const PAGE_URL = `${BASE_URL}/accrued-interest`;
const title = "CPF accrued interest on your home, explained";
const description =
  "Illustrate accrued interest on one OA housing withdrawal, then apply the CPF refund limit using your sale price and outstanding housing loan.";

export const metadata: Metadata = {
  title,
  description,
  keywords:
    "CPF accrued interest, CPF accrued interest calculator, OA used for property, CPF refund on sale, using CPF for housing",
  alternates: {
    canonical: "/accrued-interest",
  },
  openGraph: {
    title,
    description,
    url: PAGE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [OG_IMAGE.url],
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
        "Apply the market-value and net-sale-proceeds refund limitation",
      ],
    },
  ],
};

export default function AccruedInterestPage() {
  return (
    <>
      <StructuredData data={schema} />
      <PageHeader
        eyebrow="Home & OA"
        title="Accrued interest, without the forum arguments"
        lede="OA money used for a home must generally be refunded with the interest it would have earned. If a property is sold at market value and sale proceeds are insufficient, CPF Board limits the refund to the selling price less the outstanding housing loan. This tool models one lump-sum withdrawal only."
      />
      <Suspense>
        <AccruedInterestContent />
      </Suspense>
    </>
  );
}
