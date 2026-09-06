import { Geist } from "next/font/google";
import "./globals.css";
import "./product.css";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import type { Graph } from "schema-dts";
import { Providers } from "@/app/providers";
import { StructuredData } from "@/components/seo/structured-data";
import {
  BASE_URL,
  description,
  OG_BASE,
  OG_IMAGE,
  ORGANIZATION_ID,
  title,
  WEBSITE_ID,
} from "@/config";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  /*
   * Pages set a bare title; the template appends the site name. Without this
   * every page hand-wrote its own suffix, and they disagreed, a pipe on most,
   * an em dash on /faq/cpf-life, nothing at all on /faq/general.
   */
  title: {
    default: title,
    template: `%s | ${title}`,
  },
  description,
  keywords: [
    "CPF calculator",
    "CPF contribution calculator",
    "Singapore CPF",
    "CPF income ceiling",
    "CPF contribution",
    "CPF distribution",
    "OA SA MA",
    "CPF rates",
  ],
  authors: [
    {
      name: "Ru Chern Chong",
      url: "https://ruchern.dev",
    },
  ],
  /*
   * No title or description here, deliberately. Next.js fills both in from the
   * resolved page title and description whenever the openGraph block leaves
   * them unset, so every page gets its own og:title without restating it. Set
   * them here and each page has to override them, which is what had all twenty
   * pages copying the same block.
   */
  openGraph: {
    ...OG_BASE,
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE.url],
  },
};

const schema: Graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: title,
      url: BASE_URL,
      description,
      inLanguage: "en-SG",
      publisher: { "@id": ORGANIZATION_ID },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/docs?q={search_term_string}`,
        },
        // @ts-expect-error schema-dts types query-input as a Thing property
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebApplication",
      name: "SimplyCPF",
      url: BASE_URL,
      description:
        "Calculate contributions, project retirement balances, compare CPF LIFE payouts, and test CPF scenarios for Singapore.",
      applicationCategory: "FinanceApplication",
      operatingSystem: "All",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "SGD",
      },
      author: {
        "@type": "Person",
        name: "Ru Chern Chong",
      },
    },
    {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: "SimplyCPF",
      url: BASE_URL,
      logo: `${BASE_URL}/simplycpf-icon.svg`,
      description:
        "Free, open-source CPF planning tools for Singapore employees and Permanent Residents.",
      founder: {
        "@type": "Person",
        name: "Ru Chern Chong",
        url: "https://ruchern.dev",
      },
      sameAs: ["https://github.com/ruchernchong/simplycpf"],
    },
    {
      "@type": "SiteNavigationElement",
      name: "Calculator",
      url: `${BASE_URL}/calculator`,
      position: 1,
    },
    {
      "@type": "SiteNavigationElement",
      name: "Projection",
      url: `${BASE_URL}/projection`,
      position: 2,
    },
    {
      "@type": "SiteNavigationElement",
      name: "What-If",
      url: `${BASE_URL}/what-if`,
      position: 3,
    },
    {
      "@type": "SiteNavigationElement",
      name: "CPF LIFE",
      url: `${BASE_URL}/cpf-life`,
      position: 4,
    },
    {
      "@type": "SiteNavigationElement",
      name: "Interest Rates",
      url: `${BASE_URL}/interest-rates`,
      position: 5,
    },
    {
      "@type": "SiteNavigationElement",
      name: "CPF Cheat Sheet",
      url: `${BASE_URL}/cpf-cheat-sheet`,
      position: 6,
    },
    {
      "@type": "SiteNavigationElement",
      name: "Retirement Readiness",
      url: `${BASE_URL}/retirement-readiness`,
      position: 7,
    },
    {
      "@type": "SiteNavigationElement",
      name: "Investments",
      url: `${BASE_URL}/investments`,
      position: 8,
    },
    {
      "@type": "SiteNavigationElement",
      name: "About",
      url: `${BASE_URL}/about`,
      position: 9,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-SG" className={geist.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <NuqsAdapter>
          <Providers>
            {children}
            <Analytics />
            <StructuredData data={schema} />
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  );
}
