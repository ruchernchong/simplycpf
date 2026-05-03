import type { Metadata } from "next";
import Link from "next/link";
import type { Graph } from "schema-dts";
import { StructuredData } from "@/components/seo/structured-data";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BASE_URL } from "@/config";
import {
  buildGraph,
  buildPageSchema,
  pageBreadcrumb,
} from "@/lib/build-schema";
import { getCpfCheatSheetData } from "@/lib/get-cpf-cheat-sheet-data";
import { cn } from "@/lib/utils";

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
    speakableSelectors: ["h1", "[data-cheat-sheet-intro]"],
  }),
  pageBreadcrumb("CPF Cheat Sheet", `${BASE_URL}/cpf-cheat-sheet`),
]);

export default function CpfCheatSheetPage() {
  const data = getCpfCheatSheetData();

  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-3xl text-foreground tracking-tight md:text-4xl">
            Free CPF Cheat Sheet
          </h1>
          <p
            data-cheat-sheet-intro
            className="mx-auto max-w-3xl text-muted-foreground"
          >
            Keep the CPF reference numbers Singapore workers tend to search over
            and over in one printable PDF. This includes contribution rates,
            account distribution, PR graduated rates, retirement sums, BHS, and
            top-up limits.
          </p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Download instantly</CardTitle>
            <CardDescription>
              The PDF is public. No sign-up is needed to download it.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground text-sm">{data.subtitle}</p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/api/resources/cpf-cheat-sheet"
                className={cn(buttonVariants({ size: "lg" }), "justify-center")}
              >
                Download the PDF
              </Link>
              <Link
                href="/projection"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "justify-center",
                )}
              >
                Open the projection calculator
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {data.sections.map((section) => (
            <Card key={section.title} className="shadow-sm">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-border border-b bg-muted/40">
                        {section.columns.map((column) => (
                          <th
                            key={column}
                            className="px-4 py-3 font-semibold text-foreground"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.map((row) => (
                        <tr
                          key={`${section.title}-${row.join("-")}`}
                          className="border-border border-b last:border-b-0"
                        >
                          {row.map((cell) => (
                            <td
                              key={`${section.title}-${cell}`}
                              className="px-4 py-3 text-muted-foreground"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
