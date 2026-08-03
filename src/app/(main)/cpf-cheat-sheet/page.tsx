import { buttonVariants, Typography } from "@heroui/react";
import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import { CheatSheetCard } from "@/components/cpf-cheat-sheet/cheat-sheet-card";
import { PrintButton } from "@/components/cpf-cheat-sheet/print-button";
import { StructuredData } from "@/components/seo/structured-data";
import { Eyebrow } from "@/components/shared/section-header";
import { BASE_URL, OG_BASE, WEBSITE_ID } from "@/config";

const PAGE_URL = `${BASE_URL}/cpf-cheat-sheet`;
const PAGE_TITLE = "CPF Cheat Sheet";
const PAGE_DESCRIPTION =
  "Free CPF cheat sheet covering contribution rates, account distribution, PR graduated rates, retirement sums, BHS, and CPF planning reference points.";

export const metadata: Metadata = {
  title: "CPF Cheat Sheet: Free CPF Rates and Retirement Reference",
  description:
    "Download a free CPF cheat sheet covering contribution rates, OA / SA / MA distribution, PR graduated rates, retirement sums, BHS, and CPF planning reference points.",
  alternates: {
    canonical: "/cpf-cheat-sheet",
  },
  openGraph: {
    ...OG_BASE,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
  },
};

const schema: Graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}/#webpage`,
      name: "CPF Cheat Sheet",
      description: PAGE_DESCRIPTION,
      url: PAGE_URL,
      inLanguage: "en-SG",
      isPartOf: { "@id": WEBSITE_ID },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "h3"],
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "CPF Cheat Sheet",
          item: PAGE_URL,
        },
      ],
    },
  ],
};

/** Print rules live here because globals.css is shared across the app. */
const PRINT_STYLES = `
@media print {
  body { background: #fff; }
  header, footer, nav { display: none !important; }
  main { display: block; padding: 0; }
  .cheat-sheet {
    border: none;
    box-shadow: none;
    width: 100%;
    max-width: none;
    break-inside: avoid;
  }
}
`;

export default function CpfCheatSheetPage() {
  return (
    <>
      <StructuredData data={schema} />
      <style href="cheat-sheet-print" precedence="medium">
        {PRINT_STYLES}
      </style>
      <header className="flex flex-col gap-2">
        <Eyebrow color="muted">Cheat sheet</Eyebrow>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Typography type="h1">One page, on the fridge, done</Typography>
          <div className="flex flex-wrap gap-2">
            <PrintButton />
            <a
              href="/api/resources/cpf-cheat-sheet"
              className={buttonVariants({ variant: "primary" })}
            >
              Download PDF
            </a>
          </div>
        </div>
        <div className="max-w-[76ch]">
          <Typography color="muted">
            Every reference number for 2026 on a single printable sheet. No
            inputs, no personalisation, just the figures you keep having to look
            up.
          </Typography>
        </div>
      </header>
      <CheatSheetCard />
    </>
  );
}
