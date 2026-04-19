import {
  Download04Icon,
  PercentSquareIcon,
  PrinterIcon,
  Target02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Graph } from "schema-dts";
import { StructuredData } from "@/components/seo/structured-data";
import { buttonVariants } from "@/components/ui/button";
import { BASE_URL } from "@/config";
import { getBhsForYear } from "@/constants/cpf-bhs";
import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";
import {
  CPF_ADDITIONAL_SENIOR_INTEREST_CAP,
  CPF_EXTRA_INTEREST_CAP,
  CPF_EXTRA_INTEREST_RATE,
} from "@/constants/cpf-interest-tiers";
import { getRetirementSumsForYear } from "@/constants/cpf-retirement-sums";
import { ageGroups } from "@/data";
import {
  buildGraph,
  buildPageSchema,
  pageBreadcrumb,
} from "@/lib/build-schema";
import { formatCurrency } from "@/lib/format";
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

const pct = (value: number) => `${(value * 100).toFixed(1)}%`;

interface RateRow {
  label: string;
  value: string;
  highlight?: boolean;
}

function RateList({ rows }: { rows: RateRow[] }) {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {rows.map(({ label, value, highlight }) => (
        <li
          key={label}
          className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
        >
          <span className="text-[13px] text-muted-foreground">{label}</span>
          <span
            className={cn(
              "font-bold font-mono text-[14px]",
              highlight ? "text-accent" : "text-foreground",
            )}
          >
            {value}
          </span>
        </li>
      ))}
    </ul>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: typeof PercentSquareIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <HugeiconsIcon
          icon={icon}
          className="size-4 text-accent"
          strokeWidth={2}
          aria-hidden="true"
        />
        <h2 className="font-semibold text-[15px] text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

const summaryAgeBuckets = [
  {
    label: "Up to 55",
    employee: 0.2,
    employer: 0.17,
  },
  {
    label: "55 to 60",
    employee:
      ageGroups.find((g) => g.description === "Above 55 to 60")
        ?.contributionRate.employee ?? 0.15,
    employer:
      ageGroups.find((g) => g.description === "Above 55 to 60")
        ?.contributionRate.employer ?? 0.145,
  },
  {
    label: "60 to 65",
    employee:
      ageGroups.find((g) => g.description === "Above 60 to 65")
        ?.contributionRate.employee ?? 0.095,
    employer:
      ageGroups.find((g) => g.description === "Above 60 to 65")
        ?.contributionRate.employer ?? 0.11,
  },
  {
    label: "65 to 70",
    employee:
      ageGroups.find((g) => g.description === "Above 65 to 70")
        ?.contributionRate.employee ?? 0.07,
    employer:
      ageGroups.find((g) => g.description === "Above 65 to 70")
        ?.contributionRate.employer ?? 0.085,
  },
  {
    label: "Above 70",
    employee:
      ageGroups.find((g) => g.description === "Above 70")?.contributionRate
        .employee ?? 0.05,
    employer:
      ageGroups.find((g) => g.description === "Above 70")?.contributionRate
        .employer ?? 0.075,
  },
];

export default function CpfCheatSheetPage() {
  const referenceYear = 2026;
  const sums = getRetirementSumsForYear(referenceYear);
  const bhs = getBhsForYear(referenceYear);

  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-6">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="font-bold text-[30px] text-foreground tracking-tight md:text-[34px]">
            CPF Reference Sheet
          </h1>
          <p
            data-cheat-sheet-intro
            className="max-w-2xl text-[14px] text-muted-foreground"
          >
            Reference rates, ceilings, and thresholds on one page.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 print:hidden">
            <Link
              href="/api/lead-magnets/cpf-cheat-sheet"
              className={cn(buttonVariants({ size: "sm" }), "gap-2")}
            >
              <HugeiconsIcon
                icon={Download04Icon}
                className="size-4"
                strokeWidth={2}
                aria-hidden="true"
              />
              Download PDF
            </Link>
            <Link
              href="/cpf-cheat-sheet?print=1"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-2",
              )}
            >
              <HugeiconsIcon
                icon={PrinterIcon}
                className="size-4"
                strokeWidth={2}
                aria-hidden="true"
              />
              Open print view
            </Link>
          </div>
        </header>

        <SectionCard icon={PercentSquareIcon} title="Contribution Rates by Age">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[13px]">
              <thead>
                <tr className="border-border border-b text-[11px] text-muted-foreground uppercase tracking-[0.08em]">
                  <th className="py-2 font-semibold">Age Group</th>
                  <th className="py-2 font-semibold">Employee</th>
                  <th className="py-2 font-semibold">Employer</th>
                  <th className="py-2 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {summaryAgeBuckets.map(({ label, employee, employer }) => (
                  <tr
                    key={label}
                    className="border-border border-b last:border-b-0"
                  >
                    <td className="py-3 font-medium text-foreground">
                      {label}
                    </td>
                    <td className="py-3 font-mono text-muted-foreground">
                      {pct(employee)}
                    </td>
                    <td className="py-3 font-mono text-muted-foreground">
                      {pct(employer)}
                    </td>
                    <td className="py-3 font-mono text-foreground">
                      {pct(employee + employer)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard icon={PercentSquareIcon} title="Interest Rates">
            <RateList
              rows={[
                {
                  label: "Ordinary Account (OA)",
                  value: `${CPF_INTEREST_FLOOR_RATES.OA.toFixed(2)}%`,
                },
                {
                  label: "Special / Medisave / Retirement",
                  value: `${CPF_INTEREST_FLOOR_RATES.SMRA.toFixed(2)}%`,
                },
                {
                  label: `Extra ${(CPF_EXTRA_INTEREST_RATE * 100).toFixed(0)}% on first ${formatCurrency(CPF_EXTRA_INTEREST_CAP, 0)}`,
                  value: `+${(CPF_EXTRA_INTEREST_RATE * 100).toFixed(2)}%`,
                  highlight: true,
                },
                {
                  label: `Extra ${(CPF_EXTRA_INTEREST_RATE * 100).toFixed(0)}% on next ${formatCurrency(CPF_ADDITIONAL_SENIOR_INTEREST_CAP, 0)} (55+)`,
                  value: `+${(CPF_EXTRA_INTEREST_RATE * 100).toFixed(2)}%`,
                  highlight: true,
                },
              ]}
            />
          </SectionCard>

          <SectionCard
            icon={Target02Icon}
            title={`Retirement Sums (${referenceYear})`}
          >
            <RateList
              rows={[
                {
                  label: "Basic Retirement Sum",
                  value: formatCurrency(sums.brs, 0),
                },
                {
                  label: "Full Retirement Sum",
                  value: formatCurrency(sums.frs, 0),
                },
                {
                  label: "Enhanced Retirement Sum",
                  value: formatCurrency(sums.ers, 0),
                },
                {
                  label: "Basic Healthcare Sum (MA)",
                  value: formatCurrency(bhs, 0),
                },
              ]}
            />
          </SectionCard>
        </div>
      </div>
    </>
  );
}
