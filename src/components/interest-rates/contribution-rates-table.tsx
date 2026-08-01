import { Card, Table, Typography } from "@heroui/react";
import { CPF_POLICY_CATALOGUE, resolveContributionSchedule } from "@/policy";

function pct(rate: number) {
  return `${(rate * 100).toFixed(1)}%`;
}

const currentSchedule = resolveContributionSchedule(
  CPF_POLICY_CATALOGUE.metadata["cpf-contribution-rates"].verifiedAt,
).schedule;
const nextSchedule = (() => {
  const schedule = CPF_POLICY_CATALOGUE.contributionSchedules.find(
    (candidate) => candidate.effectiveFrom > currentSchedule.effectiveTo,
  );
  if (!schedule) {
    throw new Error(
      "A published next CPF contribution schedule is unavailable.",
    );
  }
  return schedule;
})();
const rows = currentSchedule.citizenRates.map((group) => {
  const nextRate = nextSchedule.citizenRates.find(
    (candidate) => candidate.id === group.id,
  );
  const employee = group.employeeBasisPoints / 10000;
  const employer = group.employerBasisPoints / 10000;

  return {
    band: group.description,
    employee: pct(employee),
    employer: pct(employer),
    total: pct(employee + employer),
    totalNext:
      nextRate === undefined
        ? "not published"
        : pct(
            (nextRate.employeeBasisPoints + nextRate.employerBasisPoints) /
              10000,
          ),
  };
});

/** Current and next published full contribution rates by age band. */
export function ContributionRatesTable() {
  const retirementAge =
    CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;
  return (
    <Card>
      <Card.Header>
        <Card.Title>Contribution rates by age</Card.Title>
        <Card.Description>
          Citizens and PRs from the 3rd year · wages above $
          {CPF_POLICY_CATALOGUE.rules.wageBands.fullRatesAbove}
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
                <Table.Column className="text-right">
                  Total {currentSchedule.effectiveFrom.slice(0, 4)}
                </Table.Column>
                <Table.Column className="text-right">
                  Total {nextSchedule.effectiveFrom.slice(0, 4)}
                </Table.Column>
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
                      {row.totalNext}
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
          The next published schedule changes the two senior bands immediately
          above age {retirementAge}. Rate changes apply from the month after a
          threshold birthday.
        </Typography>
      </Card.Footer>
    </Card>
  );
}
