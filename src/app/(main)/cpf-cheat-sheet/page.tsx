import { buttonVariants } from "@heroui/react";
import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import { CheatSheetCard } from "@/components/cheat-sheet/cheat-sheet-card";
import { PrintButton } from "@/components/cheat-sheet/print-button";
import { StructuredData } from "@/components/seo/structured-data";
import { PageHeader } from "@/components/shared/section-header";
import { BASE_URL } from "@/config";
import {
  buildGraph,
  buildPageSchema,
  pageBreadcrumb,
} from "@/lib/build-schema";

export const metadata: Metadata = {
  title: "CPF Cheat Sheet | Free CPF Rates and Retirement Reference PDF",
  description:
    "Download a free CPF cheat sheet covering contribution rates, OA / SA / MA distribution, PR graduated rates, retirement sums, BHS, and CPF planning reference points.",
  alternates: {
    canonical: "/cpf-cheat-sheet",
  },
};

const schema: Graph = buildGraph([
  buildPageSchema({
    name: "CPF Cheat Sheet",
    description:
      "Free CPF cheat sheet covering contribution rates, account distribution, PR graduated rates, retirement sums, BHS, and CPF planning reference points.",
    url: `${BASE_URL}/cpf-cheat-sheet`,
    speakableSelectors: ["h1", "h3"],
  }),
  pageBreadcrumb("CPF Cheat Sheet", `${BASE_URL}/cpf-cheat-sheet`),
]);

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
      <PageHeader
        eyebrow="Cheat sheet"
        title="One page, on the fridge, done"
        lede="Every reference number for 2026 on a single printable sheet. No inputs, no personalisation — just the figures you keep having to look up."
        actions={
          <div className="flex flex-wrap gap-2">
            <PrintButton />
            <a
              href="/api/resources/cpf-cheat-sheet"
              className={buttonVariants({ variant: "primary" })}
            >
              Download PDF
            </a>
          </div>
        }
      />
      <CheatSheetCard />
    </>
  );
}
