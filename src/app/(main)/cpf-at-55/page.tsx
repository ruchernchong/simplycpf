import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import At55Content from "@/components/at-55/at-55-content";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL, OG_IMAGE, WEBSITE_ID } from "@/config";

const PAGE_URL = `${BASE_URL}/cpf-at-55`;
const PAGE_TITLE = "What happens to your CPF at 55";
const PAGE_DESCRIPTION =
  "Your Special Account closes at 55 and a Retirement Account is created in its place. See where the money goes, in your own projected numbers.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords:
    "CPF at 55, Special Account closure, Retirement Account, CPF SA closure 2025, Full Retirement Sum, CPF withdrawal at 55",
  alternates: {
    canonical: "/cpf-at-55",
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

const schema: Graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}/#webpage`,
      name: PAGE_TITLE,
      description:
        "How the Special Account closure at 55 works, how the Retirement Account is filled to the Full Retirement Sum, and what stays in the Ordinary Account.",
      url: PAGE_URL,
      inLanguage: "en-SG",
      isPartOf: { "@id": WEBSITE_ID },
      keywords:
        "CPF at 55, Special Account closure, Retirement Account, Full Retirement Sum",
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1"],
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "At 55", item: PAGE_URL },
      ],
    },
  ],
};

export default function CpfAt55Page() {
  return (
    <>
      <StructuredData data={schema} />
      <At55Content />
    </>
  );
}
