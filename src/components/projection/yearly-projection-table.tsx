import { Card, Table } from "@heroui/react";
import { formatCurrency } from "@/lib/format";
import type { ProjectionResult } from "@/types";

interface YearlyProjectionTableProps {
  yearlyBalances: ProjectionResult["yearlyBalances"];
}

export default function YearlyProjectionTable({
  yearlyBalances,
}: YearlyProjectionTableProps) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Year-by-Year Projection</Card.Title>
        <Card.Description>
          Expand this table if you want the full yearly contribution and balance
          breakdown.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <details className="group">
          <summary className="cursor-pointer rounded-lg bg-muted/50 px-4 py-4 font-medium text-foreground text-sm transition-colors hover:bg-muted">
            See {yearlyBalances.length} yearly rows
          </summary>
          <div className="pb-2" />
          <Table variant="secondary">
            <Table.ScrollContainer>
              <Table.Content aria-label="Year by year CPF projection">
                <Table.Header>
                  <Table.Column isRowHeader>Year</Table.Column>
                  <Table.Column>Age</Table.Column>
                  <Table.Column>Age group</Table.Column>
                  <Table.Column className="text-right">Employee</Table.Column>
                  <Table.Column className="text-right">Employer</Table.Column>
                  <Table.Column className="text-right">OA</Table.Column>
                  <Table.Column className="text-right">SA</Table.Column>
                  <Table.Column className="text-right">MA</Table.Column>
                  <Table.Column className="text-right">RA</Table.Column>
                  <Table.Column className="text-right">Interest</Table.Column>
                </Table.Header>
                <Table.Body>
                  {yearlyBalances.map((row) => (
                    <Table.Row key={row.year} id={row.year}>
                      <Table.Cell>{row.year}</Table.Cell>
                      <Table.Cell>{row.age}</Table.Cell>
                      <Table.Cell>{row.ageGroup}</Table.Cell>
                      <Table.Cell className="text-right">
                        {formatCurrency(row.contributions.employee, 0)}
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        {formatCurrency(row.contributions.employer, 0)}
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        {formatCurrency(row.balances.oa, 0)}
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        {formatCurrency(row.balances.sa, 0)}
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        {formatCurrency(row.balances.ma, 0)}
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        {formatCurrency(row.balances.ra, 0)}
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        {formatCurrency(
                          row.interestEarned.oa +
                            row.interestEarned.sa +
                            row.interestEarned.ma +
                            row.interestEarned.ra +
                            row.interestEarned.extraInterest,
                          0,
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </details>
      </Card.Content>
    </Card>
  );
}
