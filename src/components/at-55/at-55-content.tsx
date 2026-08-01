"use client";

import {
  Card,
  Chip,
  cn,
  Link,
  Separator,
  Skeleton,
  Surface,
  Typography,
} from "@heroui/react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/section-header";
import { useCpfStore } from "@/hooks/use-cpf-store";
import { calculateCpfProjection } from "@/lib/calculate-cpf-projection";
import { formatCurrency } from "@/lib/format";
import { CPF_POLICY_CATALOGUE } from "@/policy";
import {
  selectAge,
  selectBirthDate,
  selectFormStep,
  selectProjectionInputs,
} from "@/stores/selectors";
import type { ProjectionResult } from "@/types";

const retirementAge =
  CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;
const payoutEligibilityAge =
  CPF_POLICY_CATALOGUE.rules.lifecycleAges.cpfLifePayoutEligibility;
const interest = CPF_POLICY_CATALOGUE.interestRateMethodology;
const closure = CPF_POLICY_CATALOGUE.rules.specialAccountClosure;
const withdrawals = CPF_POLICY_CATALOGUE.rules.retirementWithdrawals;
const withdrawalMetadata =
  CPF_POLICY_CATALOGUE.metadata["cpf-retirement-withdrawals"];

const PAGE_HEADER = {
  eyebrow: `At ${retirementAge}`,
  title: "Your Special Account closes. Here is the routing order.",
  lede: `CPF Board's Special Account closure took effect on ${closure.effectiveDate}. From age ${retirementAge}, retirement savings route to RA up to the applicable limit and then OA; the destinations have different uses and rates.`,
} as const;

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
  retirementPolicyStatus: "official" | "assumed";
}

/**
 * Annual projection rows are not day-level statements. Use the final modelled
 * pre-55 year-end as an illustrative starting point, then apply CPF Board's
 * age-55 transfer order directly: SA fills the FRS first, OA follows, and
 * remaining SA savings move to OA.
 */
function deriveFigures(
  projection: ProjectionResult,
  year55: number,
): At55Figures | null {
  const dayBeforeEntry = projection.yearlyBalances
    .filter((entry) => entry.age < retirementAge)
    .at(-1);
  const age55Entry = projection.yearlyBalances.find(
    (entry) => entry.age === retirementAge,
  );
  if (!dayBeforeEntry || !age55Entry) return null;

  const { brs, frs, ers } = age55Entry.retirementSums;
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
    retirementPolicyStatus: age55Entry.policy.retirementSums.status,
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
        "flex flex-col gap-2 rounded-2xl p-4",
        highlight && "border border-accent/25 bg-accent/10",
      )}
      variant={highlight ? "transparent" : "tertiary"}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <Chip
            color={highlight ? "accent" : "default"}
            size="sm"
            variant="tertiary"
          >
            <Chip.Label>{code}</Chip.Label>
          </Chip>
          <Typography type="body-sm" weight="medium">
            {label}
          </Typography>
        </div>
        <Typography type="h5">{money(amount)}</Typography>
      </div>
      {body && (
        <Typography className="max-w-[52ch]" color="muted" type="body-sm">
          {body}
        </Typography>
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
      <Typography className="whitespace-nowrap" color="muted" type="body-xs">
        moves
      </Typography>
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
        <Card.Title>A pre-55 snapshot, then the age-55 transfer</Card.Title>
        <Typography color="muted" type="body-xs">
          You turn {retirementAge} in {figures.year55} · illustrative FRS{" "}
          {money(figures.frs)}
        </Typography>
      </Card.Header>
      <Card.Content className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col gap-4">
            <Typography color="muted" type="body-xs">
              Last modelled year-end below {retirementAge}
            </Typography>
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
            <Typography className="text-accent" type="body-xs">
              Same balances after the age-{retirementAge} routing order
            </Typography>
            <AccountRow
              highlight
              amount={figures.dayAfter.ra}
              body={`Filled towards the Full Retirement Sum used by this scenario: ${money(figures.fromSa)} from SA first, then ${money(figures.fromOa)} from OA. The published RA floor is ${interest.specialMediSaveRetirementAccounts.floorRate.toFixed(2)}%; funds are reserved for retirement payouts, subject to CPF withdrawal rules.`}
              code="RA"
              label="Retirement Account · new"
            />
            <AccountRow
              amount={figures.dayAfter.oa}
              body={`Everything left over, including former SA savings above the FRS. The published OA floor is ${interest.ordinaryAccount.floorRate.toFixed(2)}%; withdrawal eligibility depends on CPF's age and set-aside rules.`}
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
        <Surface className="rounded-2xl p-4" variant="tertiary">
          <Typography color="muted" type="body-sm">
            This is not a day-specific CPF statement: it applies the official
            transfer order to the last annual snapshot below age {retirementAge}
            . Nothing is lost in the illustrated move: the same{" "}
            {money(figures.total)} remains in CPF. What changes is the account,
            applicable rate, and withdrawal treatment. In this scenario,{" "}
            {money(figures.dayAfter.ra)} is committed to retirement savings at a
            published floor of{" "}
            {interest.specialMediSaveRetirementAccounts.floorRate.toFixed(2)}%,
            while {money(figures.dayAfter.oa)} sits in OA at a published floor
            of {interest.ordinaryAccount.floorRate.toFixed(2)}%. Access to
            either amount remains subject to CPF withdrawal rules.
          </Typography>
        </Surface>
      </Card.Content>
    </Card>
  );
}

const CHANGE_NOTES = [
  {
    tone: "accent" as const,
    lead: "Changed:",
    text: `savings above the retirement set-aside move to OA and earn its applicable rate. That is the stated reason for closing SA from age ${retirementAge}.`,
  },
  {
    tone: "accent" as const,
    lead: "Changed:",
    text: `new contributions from age ${retirementAge} no longer go to SA. They route among OA, MA and RA under the applicable allocation table.`,
  },
  {
    tone: "chart-3" as const,
    lead: "Unchanged:",
    text: `the money remains in your CPF accounts, while payout eligibility remains from age ${payoutEligibilityAge}.`,
  },
  {
    tone: "chart-3" as const,
    lead: "Unchanged:",
    text: `members below age ${retirementAge} still have an SA earning the applicable long-term rate.`,
  },
];

function ChangedCard(): ReactNode {
  return (
    <Card>
      <Card.Header>
        <Card.Title>What changed, and what did not</Card.Title>
        <Card.Description>
          The change effective {closure.effectiveDate} moved savings between
          accounts. It did not remove them from CPF.
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
              <Typography color="muted" type="body-sm">
                <strong className="text-foreground">{note.lead}</strong>{" "}
                {note.text}
              </Typography>
            </li>
          ))}
        </ul>
      </Card.Content>
    </Card>
  );
}

function WithdrawalRulesCard(): ReactNode {
  const cohortYear = withdrawals.cohortBornOnOrAfter.slice(0, 4);
  const property = withdrawals.fromAge55.propertyOption;

  return (
    <Card>
      <Card.Header>
        <Card.Title>What may be withdrawable</Card.Title>
        <Card.Description>
          Current CPF Board rules verified {withdrawalMetadata.verifiedAt}.
          actual eligibility is personal and cohort-dependent.
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <ul className="flex flex-col gap-4">
          <li>
            <Typography color="muted" type="body-sm">
              For members born in {cohortYear} or later, up to{" "}
              <strong className="text-foreground">
                {money(withdrawals.fromAge55.unconditionalAmount)}
              </strong>{" "}
              is unconditionally withdrawable from age {retirementAge}.
            </Typography>
          </li>
          <li>
            <Typography color="muted" type="body-sm">
              After the Full Retirement Sum is set aside, excess OA savings are
              withdrawable.
            </Typography>
          </li>
          <li>
            <Typography color="muted" type="body-sm">
              A qualifying completed Singapore property whose lease lasts to at
              least age {property.minimumRemainingLeaseThroughAge} may allow
              eligible RA principal above BRS to be withdrawn, subject to
              restoring RA towards FRS when the property is sold or transferred.
            </Typography>
          </li>
        </ul>
        <Typography color="muted" type="body-xs">
          Interest, government grants and retirement top-ups are generally
          excluded from the property-backed RA amount. Check CPF Board's
          Retirement Dashboard before relying on a withdrawal figure.
        </Typography>
        <Link
          href={CPF_POLICY_CATALOGUE.sources.retirementWithdrawals.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          CPF Board withdrawal guidance
          <Link.Icon aria-hidden="true" />
        </Link>
      </Card.Content>
    </Card>
  );
}

function RetirementSumsCard({ figures }: { figures: At55Figures }): ReactNode {
  const frsMultiple = Math.round(figures.frs / figures.brs);
  const ersMultiple = Math.round(figures.ers / figures.brs);
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
      note: `Full, the default set-aside, ${frsMultiple} × BRS`,
      highlight: true,
    },
    {
      code: "ERS",
      amount: figures.ers,
      note: `Enhanced, the ceiling on voluntary top-ups, ${ersMultiple} × BRS`,
      highlight: false,
    },
  ];

  return (
    <Card>
      <Card.Header>
        <Card.Title>
          The three retirement sums, in your cohort's dollars
        </Card.Title>
        <Card.Description>
          Which one applies to you depends on property and on how much you
          choose to set aside.
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-6">
        <ul className="flex flex-col gap-4">
          {rows.map((row, index) => (
            <li className="flex flex-col gap-4" key={row.code}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-3">
                  <Chip
                    color={row.highlight ? "accent" : "default"}
                    size="sm"
                    variant="tertiary"
                  >
                    <Chip.Label>{row.code}</Chip.Label>
                  </Chip>
                  <Typography
                    className={cn(row.highlight ? "text-accent" : "text-muted")}
                    type="body-sm"
                  >
                    {row.note}
                  </Typography>
                </div>
                <Typography
                  className={cn(row.highlight && "text-accent")}
                  type="h5"
                >
                  {money(row.amount)}
                </Typography>
              </div>
              {index < rows.length - 1 && <Separator variant="secondary" />}
            </li>
          ))}
        </ul>
        <Typography className="max-w-[64ch]" color="muted" type="body-xs">
          The {figures.year55} retirement sums are{" "}
          {figures.retirementPolicyStatus === "official"
            ? "published official values"
            : "the last published values held constant and marked assumed"}
          . Balances start from zero because this screen does not collect your
          current account balances; salary is held flat and housing use is not
          modelled. This is a SimplyCPF scenario, not a forecast.
        </Typography>
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
        <Card.Title>{title}</Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <Typography className="max-w-[64ch]" color="muted" type="body-sm">
          {children}
        </Typography>
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
    if (formStep < 2 || age >= retirementAge) return null;

    const birthYear = Number(birthDate.split("/")[1]);
    if (!birthYear) return null;

    const projection = calculateCpfProjection({
      monthlyIncome,
      birthDate,
      endAge: payoutEligibilityAge,
      citizenship: citizenshipStatus,
    });

    return deriveFigures(projection, birthYear + retirementAge);
  }, [formStep, age, birthDate, monthlyIncome, citizenshipStatus]);

  const alreadyPast = mounted && formStep >= 2 && age >= retirementAge;

  return (
    <div className="flex flex-col gap-12">
      <PageHeader {...PAGE_HEADER} />

      {!mounted && <Skeleton className="h-96 w-full" />}

      {mounted && formStep < 2 && (
        <PromptCard title="Enter your salary and date of birth">
          The pre-55 annual snapshot and age-55 transfer illustration use your
          salary and age, so they need both. The inputs live on the home page
          and carry across every screen.
        </PromptCard>
      )}

      {alreadyPast && (
        <PromptCard title="This has already happened for you">
          You are {retirementAge} or older, so your Special Account has closed
          and your Retirement Account already exists. This screen projects the
          move for members who have not reached {retirementAge} yet, so there is
          nothing left to project for you. The two explanations below still
          apply.
        </PromptCard>
      )}

      {mounted && figures && <BalancesCard figures={figures} />}

      <div className="grid gap-8 lg:grid-cols-3">
        <ChangedCard />
        {mounted && figures && <RetirementSumsCard figures={figures} />}
        <WithdrawalRulesCard />
      </div>
    </div>
  );
}
