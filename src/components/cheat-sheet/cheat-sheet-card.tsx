import { Card, Separator, Table } from "@heroui/react";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { CPF_ADDITIONAL_WAGE_CEILING, CPF_INCOME_CEILING } from "@/constants";
import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";
import {
  CPF_ADDITIONAL_SENIOR_INTEREST_CAP,
  CPF_EXTRA_INTEREST_CAP,
  CPF_EXTRA_INTEREST_RATE,
} from "@/constants/cpf-interest-tiers";
import { getCpfCheatSheetData } from "@/lib/get-cpf-cheat-sheet-data";

const BHS_YEARS_SHOWN = 5;
const extraRate = CPF_EXTRA_INTEREST_RATE * 100;

function money(value: number) {
  return `$${value.toLocaleString("en-SG")}`;
}

function stripPercent(value: string) {
  return value.replace("%", "");
}

function SheetRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[12.5px]">
      <span className="text-muted">{label}</span>
      <span className="shrink-0 font-medium text-foreground">{value}</span>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-mono text-[10px] text-accent uppercase tracking-[0.12em]">
        {title}
      </h3>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

/**
 * The printable reference sheet: three hairline-separated columns of 2026
 * figures, all sourced from the shared cheat sheet data.
 */
export function CheatSheetCard() {
  const data = getCpfCheatSheetData();

  function rowsOf(title: string) {
    return data.sections.find((section) => section.title === title)?.rows ?? [];
  }

  function youngestBand(rows: string[][]) {
    return rows.find((row) => row[0] === "35 and below");
  }

  const contributionRows = rowsOf("CPF Contribution Rates by Age");
  const allocationRows = rowsOf("OA / SA / MA Distribution");
  const retirementSumRows = rowsOf("Retirement Sums");
  const bhsRows = rowsOf("Basic Healthcare Sum").slice(-BHS_YEARS_SHOWN);
  const prYear1 = youngestBand(rowsOf("PR Graduated Rates: Year 1"));
  const prYear2 = youngestBand(rowsOf("PR Graduated Rates: Year 2"));
  const fullRates = youngestBand(contributionRows);

  const monthlyCeiling = Object.values(CPF_INCOME_CEILING).at(-1) ?? 0;

  return (
    <Card className="cheat-sheet">
      <Card.Header className="flex flex-row flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Logo className="size-[22px]" />
          <Card.Title className="font-semibold text-[13px] text-foreground">
            CPF reference sheet · 2026
          </Card.Title>
        </div>
        <Card.Description className="font-mono text-[11px] text-muted">
          Effective 1 January 2026
        </Card.Description>
      </Card.Header>

      <Separator />

      <Card.Content>
        <div className="flex flex-col gap-8 md:flex-row md:items-stretch">
          <div className="flex flex-1 flex-col gap-6">
            <Block title="Ceilings">
              <SheetRow
                label="Monthly ordinary wage"
                value={money(monthlyCeiling)}
              />
              <SheetRow
                label="Annual salary ceiling"
                value={money(CPF_ADDITIONAL_WAGE_CEILING)}
              />
              <SheetRow
                label="Additional wage ceiling"
                value={`${money(CPF_ADDITIONAL_WAGE_CEILING)} − OW`}
              />
            </Block>
            <Block title="Interest">
              <SheetRow
                label="OA floor"
                value={`${CPF_INTEREST_FLOOR_RATES.OA.toFixed(2)}%`}
              />
              <SheetRow
                label="SA · MA · RA floor"
                value={`${CPF_INTEREST_FLOOR_RATES.SMRA.toFixed(2)}%`}
              />
              <SheetRow
                label={`Extra, first ${money(CPF_EXTRA_INTEREST_CAP)}`}
                value={`+${extraRate.toFixed(2)}%`}
              />
              <SheetRow
                label={`Extra at 55+, first ${money(CPF_ADDITIONAL_SENIOR_INTEREST_CAP)}`}
                value={`+${(extraRate * 2).toFixed(2)}%`}
              />
            </Block>
            <Block title="Key ages">
              {data.keyAges.map((age) => (
                <SheetRow key={age.label} label={age.label} value={age.value} />
              ))}
            </Block>
          </div>

          <Separator orientation="vertical" className="hidden md:block" />

          <div className="flex flex-1 flex-col gap-6">
            <Block title="Contribution rates · you + employer">
              {contributionRows.map(([band, employee, employer]) => (
                <SheetRow
                  key={band}
                  label={band}
                  value={`${employee} + ${employer}`}
                />
              ))}
            </Block>
            <Block title="Allocation · OA / SA / MA">
              {allocationRows.map(([band, oa, sa, ma]) => (
                <SheetRow
                  key={band}
                  label={band}
                  value={
                    <span className="font-mono text-[11.5px]">
                      {stripPercent(oa)} / {stripPercent(sa)} /{" "}
                      {stripPercent(ma)}
                    </span>
                  }
                />
              ))}
            </Block>
          </div>

          <Separator orientation="vertical" className="hidden md:block" />

          <div className="flex flex-1 flex-col gap-6">
            <section className="flex flex-col gap-2">
              <h3 className="font-mono text-[10px] text-accent uppercase tracking-[0.12em]">
                Retirement sums
              </h3>
              <Table variant="secondary">
                <Table.ScrollContainer>
                  <Table.Content aria-label="CPF retirement sums by cohort">
                    <Table.Header>
                      <Table.Column isRowHeader>Turn 55</Table.Column>
                      <Table.Column className="text-right">BRS</Table.Column>
                      <Table.Column className="text-right">FRS</Table.Column>
                      <Table.Column className="text-right">ERS</Table.Column>
                    </Table.Header>
                    <Table.Body>
                      {retirementSumRows.map(([year, brs, frs, ers]) => (
                        <Table.Row key={year} id={year}>
                          <Table.Cell>{year}</Table.Cell>
                          <Table.Cell className="text-right">{brs}</Table.Cell>
                          <Table.Cell className="text-right">{frs}</Table.Cell>
                          <Table.Cell className="text-right">{ers}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Content>
                </Table.ScrollContainer>
              </Table>
            </section>
            <Block title="Basic Healthcare Sum">
              {bhsRows.map(([year, amount]) => (
                <SheetRow key={year} label={year} value={amount} />
              ))}
            </Block>
            <Block title="PR rates · 35 and below">
              <SheetRow
                label="1st year of PR"
                value={`${prYear1?.[1]} + ${prYear1?.[2]}`}
              />
              <SheetRow
                label="2nd year of PR"
                value={`${prYear2?.[1]} + ${prYear2?.[2]}`}
              />
              <SheetRow
                label="3rd year onwards"
                value={`${fullRates?.[1]} + ${fullRates?.[2]}`}
              />
            </Block>
          </div>
        </div>
      </Card.Content>

      <Separator />

      <Card.Footer className="flex flex-wrap items-end justify-between gap-4 text-[11.5px]">
        <p className="max-w-[76ch] text-muted leading-relaxed">
          Figures as published by the CPF Board; employee share stated first.
          Retirement sums apply to the cohort turning 55 in that year and stay
          fixed for life. Independent tool — estimates only, not financial
          advice.
        </p>
        <span className="font-mono text-muted">simplycpf.com</span>
      </Card.Footer>
    </Card>
  );
}
