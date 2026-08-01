import { Card, Separator, Table, Typography } from "@heroui/react";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { getCpfCheatSheetData } from "@/lib/get-cpf-cheat-sheet-data";

const BHS_YEARS_SHOWN = 5;

function SheetRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}): ReactNode {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <Typography color="muted" type="body-sm">
        {label}
      </Typography>
      <Typography className="shrink-0" type="body-sm" weight="medium">
        {value}
      </Typography>
    </div>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactNode {
  return (
    <section className="flex flex-col gap-2">
      <Typography className="text-accent" type="h6">
        {title}
      </Typography>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

/**
 * The printable reference sheet, sourced from the shared catalogue data.
 */
export function CheatSheetCard(): ReactNode {
  const data = getCpfCheatSheetData();

  function rowsOf(title: string): string[][] {
    return data.sections.find((section) => section.title === title)?.rows ?? [];
  }

  function firstBand(rows: string[][]): string[] | undefined {
    return rows[0];
  }

  const contributionRows = rowsOf("CPF Contribution Rates by Age");
  const allocationRows = rowsOf("OA / SA or RA / MA Allocation");
  const retirementSumRows = rowsOf("Retirement Sums");
  const bhsRows = rowsOf("Basic Healthcare Sum").slice(-BHS_YEARS_SHOWN);
  const interestRows = rowsOf("CPF Interest Reference");
  const prYear1 = firstBand(rowsOf("PR Graduated Rates: Year 1"));
  const prYear2 = firstBand(rowsOf("PR Graduated Rates: Year 2"));
  const fullRates = firstBand(contributionRows);
  const retirementAccountAge = data.keyAges.find(
    (age) => age.label === "RA opens; SA closes",
  )?.value;
  const currentCeiling = rowsOf("Wage Ceiling Timeline").find((row) =>
    row[0]?.startsWith(data.effectiveFrom),
  );
  const officialSourceUrls = [
    ...new Set([
      ...data.keyAges.map((age) => age.sourceUrl),
      ...data.sections.flatMap((section) => section.sourceUrls),
    ]),
  ];

  return (
    <Card className="cheat-sheet">
      <Card.Header className="flex flex-row flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Logo className="size-[22px]" />
          <Card.Title>CPF reference sheet · {data.referenceYear}</Card.Title>
        </div>
        <Card.Description>
          Effective {data.effectiveFrom} · catalogue v{data.catalogueVersion}
        </Card.Description>
      </Card.Header>

      <Separator />

      <Card.Content>
        <div className="flex flex-col gap-8 md:flex-row md:items-stretch">
          <div className="flex flex-1 flex-col gap-6">
            <Block title="Ceilings">
              <SheetRow
                label="Monthly ordinary wage"
                value={currentCeiling?.[1]}
              />
              <SheetRow
                label="Annual additional wage"
                value={currentCeiling?.[2]}
              />
              <SheetRow
                label="AW context"
                value="Annual AW ceiling − annual OW − prior AW"
              />
            </Block>
            <Block title="Interest">
              {interestRows.map(([label, value]) => (
                <SheetRow key={label} label={label} value={value} />
              ))}
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
            <Block title="Allocation · OA / retirement / MA">
              {allocationRows.map(([band, oa, retirement, ma]) => (
                <SheetRow
                  key={band}
                  label={band}
                  value={`${oa} / ${retirement} / ${ma}`}
                />
              ))}
            </Block>
          </div>

          <Separator orientation="vertical" className="hidden md:block" />

          <div className="flex flex-1 flex-col gap-6">
            <section className="flex flex-col gap-2">
              <Typography className="text-accent" type="h6">
                Retirement sums
              </Typography>
              <Table variant="secondary">
                <Table.ScrollContainer>
                  <Table.Content aria-label="CPF retirement sums by cohort">
                    <Table.Header>
                      <Table.Column isRowHeader>
                        Turn {retirementAccountAge}
                      </Table.Column>
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
            <Block title={`PR rates · ${fullRates?.[0] ?? "first age band"}`}>
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

      <Card.Footer className="flex flex-wrap items-end justify-between gap-4">
        <Typography className="max-w-[76ch]" color="muted" type="body-xs">
          Each policy section carries its own verification date and first-party
          sources. Employee share is stated first. Retirement sums are
          cohort-specific; ERS follows the prevailing year. Scope: {data.scope}
          Independent tool, not financial advice.
        </Typography>
        <div className="flex max-w-[76ch] flex-wrap justify-end gap-2">
          {officialSourceUrls.map((url, index) => (
            <a
              key={url}
              className="text-xs underline underline-offset-2"
              href={url}
              rel="noreferrer"
              target="_blank"
            >
              Official source {index + 1}
            </a>
          ))}
        </div>
      </Card.Footer>
    </Card>
  );
}
