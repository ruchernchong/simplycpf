import { Geist } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import type { WebApplication, WithContext } from "schema-dts";
import { Providers } from "@/app/providers";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, title } from "@/config";

const geist = Geist({ subsets: ["latin"] });

const description =
  "Your CPF, simplified. Calculate your CPF contributions with the latest income ceiling changes.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title,
  description,
  authors: [
    {
      name: "Ru Chern Chong",
      url: "https://ruchern.dev",
    },
  ],
  openGraph: {
    siteName: title,
    url: BASE_URL,
  },
};

const schema: WithContext<WebApplication> = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SimplyCPF",
  url: BASE_URL,
  description:
    "Calculate your CPF contributions with the latest income ceiling changes. Your CPF, simplified.",
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
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={geist.className}>
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
