"use client";

import {
  Card,
  Chip,
  cn,
  Link,
  Separator,
  Skeleton,
  Surface,
} from "@heroui/react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/section-header";
import { getRetirementSumsForYear } from "@/constants/cpf-retirement-sums";
import { useCpfStore } from "@/hooks/use-cpf-store";
import { calculateCpfProjection } from "@/lib/calculate-cpf-projection";
import { formatCurrency } from "@/lib/format";
import {
  selectAge,
  selectBirthDate,
  selectFormStep,
  selectProjectionInputs,
} from "@/stores/selectors";
import type { ProjectionResult } from "@/types";

const PAGE_HEADER = {
  eyebrow: "At 55",
  title: "Your Special Account closes. Here is where the money goes.",
  lede: "The CPF Board closed the Special Accounts of about 1.4 million members aged 55 and above on 19 January 2025. If you turn 55 after that date, it happens on your birthday. Nothing is taken away, it moves, and the two destinations behave differently.",
} as const;

const MONO_LABEL = "font-mono text-[10px] uppercase tracking-[0.12em]";

interface At55Figures {
  year55: number;
  brs: number;
  frs: number;
  ers: number;
  dayBefore: { oa: number; sa: number; ma: number };
  dayAfter: { ra: number; oa: number; ma: number };
  fromSa: number;
  fromOa: number;
  total: number;
}

/**
 * The projection captures milestones.age55 after a full year of contributions,
 * interest and the SA to RA conversion, so it cannot be read as the moment of
 * the birthday. The last balance before 55 is the honest "day before", and the
 * "day after" applies the conversion order to it directly: SA fills the FRS
 * first, then OA, and whatever is left over lands in OA.
 */
function deriveFigures(
  projection: ProjectionResult,
  year55: number,
): At55Figures | null {
  const dayBeforeEntry = projection.yearlyBalances
    .filter((entry) => entry.age < 55)
    .at(-1);
  if (!dayBeforeEntry) return null;

  const { brs, frs, ers } = getRetirementSumsForYear(year55);
  const { oa, sa, ma } = dayBeforeEntry.balances;

  const fromSa = Math.min(sa, frs);
  const fromOa = Math.min(oa, frs - fromSa);
  const ra = fromSa + fromOa;
  const oaAfter = oa - fromOa + Math.max(0, sa - frs);

  return {
    year55,
    brs,
    frs,
    ers,
    dayBefore: { oa, sa, ma },
    dayAfter: { ra, oa: oaAfter, ma },
    fromSa,
    fromOa,
    total: oa + sa + ma,
  };
}

function money(value: number): string {
  return formatCurrency(value, 0);
}

interface AccountRowProps {
  code: string;
  label: string;
  amount: number;
  body?: string;
  highlight?: boolean;
}

function AccountRow({
  code,
  label,
  amount,
  body,
  highlight,
}: AccountRowProps): ReactNode {
  return (
    <Surface
      className={cn(
        "flex flex-col gap-2 rounded-lg p-4",
        highlight && "border border-accent/25 bg-accent/10",
      )}
      variant={highlight ? "transparent" : "tertiary"}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="flex items-baseline gap-2">
          <Chip
            color={highlight ? "accent" : "default"}
            size="sm"
            variant="tertiary"
          >
            <Chip.Label className={MONO_LABEL}>{code}</Chip.Label>
          </Chip>
          <span className="font-medium text-sm">{label}</span>
        </span>
        <span className="font-semibold text-lg tracking-tight">
          {money(amount)}
        </span>
      </div>
      {body && (
        <p className="max-w-[52ch] text-muted text-sm leading-relaxed">
          {body}
        </p>
      )}
    </Surface>
  );
}

function MovesDivider(): ReactNode {
  return (
    <div
      aria-hidden
      className="flex flex-row items-center justify-center gap-3 md:flex-col"
    >
      <Separator className="flex-1 md:hidden" variant="secondary" />
      <Separator
        className="hidden md:block md:flex-1"
        orientation="vertical"
        variant="secondary"
      />
      <span className={cn(MONO_LABEL, "whitespace-nowrap text-muted")}>
        moves
      </span>
      <Separator className="flex-1 md:hidden" variant="secondary" />
      <Separator
        className="hidden md:block md:flex-1"
        orientation="vertical"
        variant="secondary"
      />
    </div>
  );
}

function BalancesCard({ figures }: { figures: At55Figures }): ReactNode {
  return (
    <Card>
      <Card.Header className="flex flex-wrap items-start justify-between gap-4">
        <Card.Title className="font-semibold text-base tracking-tight">
          Your projected balances the day before, and the day after
        </Card.Title>
        <span className={cn(MONO_LABEL, "text-muted")}>
          You turn 55 in {figures.year55} · FRS for that cohort{" "}
          {money(figures.frs)}
        </span>
      </Card.Header>
      <Card.Content className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col gap-4">
            <span className={cn(MONO_LABEL, "text-muted")}>
              Day before · age 54
            </span>
            <AccountRow
              amount={figures.dayBefore.sa}
              code="SA"
              label="Special Account"
            />
            <AccountRow
              amount={figures.dayBefore.oa}
              code="OA"
              label="Ordinary Account"
            />
            <AccountRow
              amount={figures.dayBefore.ma}
              code="MA"
              label="MediSave"
            />
          </div>
          <MovesDivider />
          <div className="flex flex-col gap-4">
            <span className={cn(MONO_LABEL, "text-accent")}>
              Day after · age 55
            </span>
            <AccountRow
              highlight
              amount={figures.dayAfter.ra}
              body={`Filled to your Full Retirement Sum, ${money(figures.fromSa)} from SA first, then ${money(figures.fromOa)} from OA. Keeps earning 4.00%. Locked until payouts.`}
              code="RA"
              label="Retirement Account · new"
            />
            <AccountRow
              amount={figures.dayAfter.oa}
              body="Everything left over, including former SA savings above the FRS. Earns 2.50%. Withdrawable on demand from 55."
              code="OA"
              label="Ordinary Account"
            />
            <AccountRow
              amount={figures.dayAfter.ma}
              code="MA"
              label="MediSave · unchanged"
            />
          </div>
        </div>
        <Surface
          className="rounded-lg p-4 text-[13px] text-muted leading-relaxed"
          variant="tertiary"
        >
          Nothing is lost in the move: the same {money(figures.total)} is still
          yours. What changes is the interest rate on each part and when you can
          reach it, {money(figures.dayAfter.ra)} is committed to payouts at
          4.00%, and {money(figures.dayAfter.oa)} sits in OA at 2.50%,
          withdrawable whenever you want it.
        </Surface>
      </Card.Content>
    </Card>
  );
}

const CHANGE_NOTES = [
  {
    tone: "accent" as const,
    lead: "Changed:",
    text: "savings that can be withdrawn on demand now earn the short-term rate. That is the stated reason for closing the SA at 55.",
  },
  {
    tone: "accent" as const,
    lead: "Changed:",
    text: "new contributions after 55 no longer go to an SA. They go to OA, MA and RA.",
  },
  {
    tone: "chart-3" as const,
    lead: "Unchanged:",
    text: "your total balance, your FRS requirement, and your payout eligibility age of 65.",
  },
  {
    tone: "chart-3" as const,
    lead: "Unchanged:",
    text: "members below 55 still have an SA earning the long-term rate.",
  },
];

function ChangedCard(): ReactNode {
  return (
    <Card>
      <Card.Header>
        <Card.Title className="font-semibold text-base tracking-tight">
          What changed, and what did not
        </Card.Title>
        <Card.Description className="text-muted text-sm leading-relaxed">
          The 2025 change moved savings between accounts. It did not change how
          much you have.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <ul className="flex flex-col gap-4">
          {CHANGE_NOTES.map((note) => (
            <li
              className="flex items-baseline gap-3"
              key={`${note.lead}-${note.text}`}
            >
              <span
                aria-hidden
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  note.tone === "accent" ? "bg-accent" : "bg-chart-3",
                )}
              />
              <p className="text-sm leading-relaxed">
                <span className="font-medium">{note.lead}</span>{" "}
                <span className="text-muted">{note.text}</span>
              </p>
            </li>
          ))}
        </ul>
      </Card.Content>
    </Card>
  );
}

function RetirementSumsCard({ figures }: { figures: At55Figures }): ReactNode {
  const rows = [
    {
      code: "BRS",
      amount: figures.brs,
      note: "Basic, possible with a property pledge",
      highlight: false,
    },
    {
      code: "FRS",
      amount: figures.frs,
      note: "Full, the default set-aside, 2 × BRS",
      highlight: true,
    },
    {
      code: "ERS",
      amount: figures.ers,
      note: "Enhanced, the ceiling on voluntary top-ups, 4 × BRS",
      highlight: false,
    },
  ];

  return (
    <Card>
      <Card.Header>
        <Card.Title className="font-semibold text-base tracking-tight">
          The three retirement sums, in your cohort's dollars
        </Card.Title>
        <Card.Description className="text-muted text-sm leading-relaxed">
          Which one applies to you depends on property and on how much you
          choose to set aside.
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-6">
        <ul className="flex flex-col gap-4">
          {rows.map((row, index) => (
            <li className="flex flex-col gap-4" key={row.code}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="flex items-baseline gap-3">
                  <Chip
                    color={row.highlight ? "accent" : "default"}
                    size="sm"
                    variant="tertiary"
                  >
                    <Chip.Label className={MONO_LABEL}>{row.code}</Chip.Label>
                  </Chip>
                  <span
                    className={cn(
                      "text-sm",
                      row.highlight ? "text-accent" : "text-muted",
                    )}
                  >
                    {row.note}
                  </span>
                </span>
                <span
                  className={cn(
                    "font-semibold text-lg tracking-tight",
                    row.highlight && "text-accent",
                  )}
                >
                  {money(row.amount)}
                </span>
              </div>
              {index < rows.length - 1 && <Separator variant="secondary" />}
            </li>
          ))}
        </ul>
        <p className="max-w-[64ch] text-[12px] text-muted leading-relaxed">
          Sums for the cohort turning 55 in {figures.year55}, projected from
          published figures at 3.5% a year beyond 2026. Balances projected from
          a zero starting balance today, with your salary held flat; housing use
          is not modelled. Estimates, not advice.
        </p>
      </Card.Content>
    </Card>
  );
}

function PromptCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactNode {
  return (
    <Card>
      <Card.Header>
        <Card.Title className="font-semibold text-base tracking-tight">
          {title}
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p className="max-w-[64ch] text-muted text-sm leading-relaxed">
          {children}
        </p>
        <Link href="/">Go to the home page</Link>
      </Card.Content>
    </Card>
  );
}

export default function At55Content(): ReactNode {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const formStep = useCpfStore(selectFormStep);
  const age = useCpfStore(selectAge);
  const birthDate = useCpfStore(selectBirthDate);
  const { monthlyIncome, citizenshipStatus } = useCpfStore(
    selectProjectionInputs,
  );

  const figures = useMemo(() => {
    if (formStep < 2 || age >= 55) return null;

    const birthYear = Number(birthDate.split("/")[1]);
    if (!birthYear) return null;

    const projection = calculateCpfProjection({
      monthlyIncome,
      birthDate,
      endAge: 65,
      citizenship: citizenshipStatus,
    });

    return deriveFigures(projection, birthYear + 55);
  }, [formStep, age, birthDate, monthlyIncome, citizenshipStatus]);

  const alreadyPast = mounted && formStep >= 2 && age >= 55;

  return (
    <div className="flex flex-col gap-12">
      <PageHeader {...PAGE_HEADER} />

      {!mounted && <Skeleton className="h-96 w-full rounded-lg" />}

      {mounted && formStep < 2 && (
        <PromptCard title="Enter your salary and date of birth">
          The day-before and day-after balances are projected from your own
          salary and age, so they need both. The inputs live on the home page
          and carry across every screen.
        </PromptCard>
      )}

      {alreadyPast && (
        <PromptCard title="This has already happened for you">
          You are 55 or older, so your Special Account has closed and your
          Retirement Account already exists. This screen projects the move for
          members who have not reached 55 yet, so there is nothing left to
          project for you. The two explanations below still apply.
        </PromptCard>
      )}

      {mounted && figures && <BalancesCard figures={figures} />}

      <div className="grid gap-8 md:grid-cols-2">
        <ChangedCard />
        {mounted && figures && <RetirementSumsCard figures={figures} />}
      </div>
    </div>
  );
}
