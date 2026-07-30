import type { Metadata } from "next";
import { Suspense } from "react";
import { AccruedInterestContent } from "@/components/housing/accrued-interest-content";
import { StructuredData } from "@/components/seo/structured-data";
import { PageHeader } from "@/components/shared/section-header";
import { BASE_URL } from "@/config";
import {
  buildGraph,
  buildPageSchema,
  buildWebApplication,
  pageBreadcrumb,
} from "@/lib/build-schema";

const title = "CPF accrued interest on your home, explained | SimplyCPF";
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
    title,
    description,
    url: `${BASE_URL}/accrued-interest`,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "CPF accrued interest explained - SimplyCPF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${BASE_URL}/opengraph-image`],
  },
};

const schema = buildGraph([
  buildPageSchema({
    name: "CPF accrued interest on your home",
    description,
    url: `${BASE_URL}/accrued-interest`,
    speakableSelectors: ["h1"],
    keywords:
      "CPF accrued interest, OA used for property, CPF refund on sale, housing withdrawal",
  }),
  pageBreadcrumb("Accrued interest", `${BASE_URL}/accrued-interest`),
  buildWebApplication({
    name: "SimplyCPF Accrued Interest Illustration",
    url: `${BASE_URL}/accrued-interest`,
    featureList: [
      "Illustrate accrued interest on OA used for a home",
      "See the cumulative interest year by year",
      "See how much of a sale returns to CPF before any cash",
    ],
  }),
]);

export default function AccruedInterestPage() {
  return (
    <>
      <StructuredData data={schema} />
      <PageHeader
        eyebrow="Home & OA"
        title="Accrued interest, without the forum arguments"
        lede="OA money you put into a home keeps a running 2.5% tab — the interest it would have earned had it stayed. When you sell, the principal plus that accrued interest returns to your CPF before you see any cash. It is a refund to yourself, not a penalty, but it changes what a sale actually pays out."
      />
      <Suspense>
        <AccruedInterestContent />
      </Suspense>
    </>
  );
}
