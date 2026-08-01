import { Card, Table, Typography } from "@heroui/react";
import { CPF_TOTAL_CONTRIBUTION_RATES_2027 } from "@/constants/cpf-contribution-rates-2027";
import { ageGroups } from "@/data";

function pct(rate: number) {
  return `${(rate * 100).toFixed(1)}%`;
}

const rows = ageGroups.map((group) => {
  const { employee, employer } = group.contributionRate;
  const rate2027 = CPF_TOTAL_CONTRIBUTION_RATES_2027[group.description];

  return {
    band: group.description,
    employee: pct(employee),
    employer: pct(employer),
    total: pct(employee + employer),
    total2027: rate2027 ? `${rate2027.toFixed(1)}%` : "no change",
  };
});

/** Full contribution rates by age band, with the legislated 2027 step. */
export function ContributionRatesTable() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Contribution rates by age</Card.Title>
        <Card.Description>
          Citizens and PRs from the 3rd year · wages above $750
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <Table variant="secondary">
          <Table.ScrollContainer>
            <Table.Content aria-label="CPF contribution rates by age band">
              <Table.Header>
                <Table.Column isRowHeader>Age band</Table.Column>
                <Table.Column className="text-right">You</Table.Column>
                <Table.Column className="text-right">Employer</Table.Column>
                <Table.Column className="text-right">Total 2026</Table.Column>
                <Table.Column className="text-right">Total 2027</Table.Column>
              </Table.Header>
              <Table.Body>
                {rows.map((row) => (
                  <Table.Row key={row.band} id={row.band}>
                    <Table.Cell>{row.band}</Table.Cell>
                    <Table.Cell className="text-right">
                      {row.employee}
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      {row.employer}
                    </Table.Cell>
                    <Table.Cell className="text-right font-semibold">
                      {row.total}
                    </Table.Cell>
                    <Table.Cell className="text-right text-accent">
                      {row.total2027}
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
          Rates for ages above 55 to 65 rose on 1 January 2026 and are
          legislated to rise again in 2027, moving senior rates towards the
          under-55 rate.
        </Typography>
      </Card.Footer>
    </Card>
  );
}
