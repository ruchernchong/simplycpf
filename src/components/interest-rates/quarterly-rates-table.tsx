import { Card, Table, Typography } from "@heroui/react";
import { QUARTERLY_CPF_RATES } from "@/constants/cpf-interest-rates";

const LATEST_QUARTERS = 6;

const rows = QUARTERLY_CPF_RATES.slice(-LATEST_QUARTERS);

/** Rates as declared by the CPF Board each quarter, newest last. */
export function QuarterlyRatesTable() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Declared quarterly rates</Card.Title>
        <Card.Description>Per year</Card.Description>
      </Card.Header>
      <Card.Content>
        <Table variant="secondary">
          <Table.ScrollContainer>
            <Table.Content aria-label="Declared quarterly CPF interest rates">
              <Table.Header>
                <Table.Column isRowHeader>Quarter</Table.Column>
                <Table.Column className="text-right">OA</Table.Column>
                <Table.Column className="text-right">SMRA</Table.Column>
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
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </Card.Content>
      <Card.Footer>
        <Typography color="muted" type="body-sm">
          SMRA rates have sat at the 4.00% floor since 2025 Q1. Rates are
          declared each quarter.
        </Typography>
      </Card.Footer>
    </Card>
  );
}
