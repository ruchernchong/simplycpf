import { Geist } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import type { Graph } from "schema-dts";
import { Providers } from "@/app/providers";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, title } from "@/config";

const geist = Geist({ subsets: ["latin"] });

const description =
  "Your CPF, simplified. Calculate contributions, project retirement balances, compare CPF LIFE payouts, and test CPF scenarios for Singapore.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title,
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
  openGraph: {
    type: "website",
    locale: "en_SG",
    siteName: title,
    url: BASE_URL,
    title,
    description,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "SimplyCPF - Your CPF, simplified.",
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

const schema: Graph = {
  "@context": "https://schema.org",
  "@graph": [
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
      name: "SimplyCPF",
      url: BASE_URL,
      logo: `${BASE_URL}/icon.svg`,
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
    <html lang="en" className={geist.className} suppressHydrationWarning>
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
