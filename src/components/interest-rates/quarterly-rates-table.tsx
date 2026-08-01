import { Card, Link, Table, Typography } from "@heroui/react";
import { CPF_POLICY_CATALOGUE } from "@/policy";

const LATEST_QUARTERS = 6;

const rows = CPF_POLICY_CATALOGUE.quarterlyInterestRates.slice(
  -LATEST_QUARTERS,
);
const latestRow = rows.at(-1);

/** Rates as declared by the CPF Board each quarter, newest last. */
export function QuarterlyRatesTable() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Declared quarterly rates</Card.Title>
        <Card.Description>
          Official CPF Board declarations, per annum
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <Table variant="secondary">
          <Table.ScrollContainer>
            <Table.Content aria-label="Declared quarterly CPF interest rates">
              <Table.Header>
                <Table.Column isRowHeader>Quarter</Table.Column>
                <Table.Column className="text-right">OA</Table.Column>
                <Table.Column className="text-right">SA</Table.Column>
                <Table.Column className="text-right">MA</Table.Column>
                <Table.Column className="text-right">RA</Table.Column>
              </Table.Header>
              <Table.Body>
                {rows.map((row) => (
                  <Table.Row key={row.quarter} id={row.quarter}>
                    <Table.Cell>{row.quarter}</Table.Cell>
                    <Table.Cell className="text-right">
                      {row.oa.toFixed(2)}%
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      {row.sa.toFixed(2)}%
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      {row.ma.toFixed(2)}%
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      {row.ra.toFixed(2)}%
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </Card.Content>
      <Card.Footer>
        <div className="flex flex-col gap-2">
          <Typography color="muted" type="body-sm">
            No monthly SGS values are inferred. The published SMRA method uses
            the 12-month average yield of 10-year Singapore Government
            Securities plus the documented margin. Latest declaration verified{" "}
            {latestRow?.verifiedAt ?? "with its linked source"}.
          </Typography>
          {latestRow && (
            <Link
              href={latestRow.sourceUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              CPF Board source for {latestRow.quarter}
              <Link.Icon aria-hidden="true" />
            </Link>
          )}
        </div>
      </Card.Footer>
    </Card>
  );
}
