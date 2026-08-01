import { Card, Link, Table, Typography } from "@heroui/react";
import { formatCurrency } from "@/lib/format";
import { CPF_LIFE_POLICY, CPF_POLICY_RULES } from "@/policy";
import type { ProjectionResult } from "@/types";

interface CpfLifeReferenceProps {
  result: ProjectionResult;
}

export default function CpfLifeReference({ result }: CpfLifeReferenceProps) {
  const reference = result.cpfLifeReference;
  const retirementAccountAge =
    CPF_POLICY_RULES.lifecycleAges.retirementAccountCreated;
  const payoutEligibilityAge = CPF_LIFE_POLICY.payoutStart.earliestAge;
  const latestPayoutStartAge = CPF_LIFE_POLICY.payoutStart.latestAge;
  const hasPayoutEligibilityAge = result.yearlyBalances.some(
    ({ age }) => age >= payoutEligibilityAge,
  );

  return (
    <Card>
      <Card.Header>
        <Card.Title>CPF LIFE official reference rows</Card.Title>
        <Card.Description>
          {hasPayoutEligibilityAge
            ? `Your projected RA around age ${payoutEligibilityAge} is ${formatCurrency(result.milestones.age65.ra, 0)}. CPF Board does not publish a formula that SimplyCPF can use to turn it into a personalised payout.`
            : `Extend the projection through age ${payoutEligibilityAge} to see your projected RA alongside CPF Board's exact reference rows.`}
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <Table variant="secondary">
          <Table.ScrollContainer>
            <Table.Content
              aria-label={`CPF Board ${reference.referenceYear} Standard Plan reference payouts`}
              className="min-w-[640px]"
            >
              <Table.Header>
                <Table.Column isRowHeader>
                  RA at {retirementAccountAge}
                </Table.Column>
                <Table.Column className="text-right">
                  RA at {payoutEligibilityAge}
                </Table.Column>
                <Table.Column className="text-right">
                  Monthly from {payoutEligibilityAge}
                </Table.Column>
                <Table.Column className="text-right">
                  Monthly from {latestPayoutStartAge}
                </Table.Column>
              </Table.Header>
              <Table.Body>
                {reference.rows.map((row) => (
                  <Table.Row id={row.raAt55} key={row.raAt55}>
                    <Table.Cell>{formatCurrency(row.raAt55, 0)}</Table.Cell>
                    <Table.Cell className="text-right">
                      {formatCurrency(row.raAt65, 0)}
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      {formatCurrency(row.monthlyPayoutAt65, 0)}
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      {formatCurrency(row.monthlyPayoutAt70, 0)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
        <Typography color="muted" type="body-xs">
          {reference.referenceYear} reference for a male member on the Standard
          Plan. No interpolation or Standard / Basic / Escalating ratio is
          applied.
        </Typography>
        <div className="flex flex-wrap gap-4">
          <Link href={reference.sourceUrl} target="_blank">
            CPF Board reference table
          </Link>
          <Link href={reference.personalisedEstimatorUrl} target="_blank">
            CPF Retirement Payout Planner
          </Link>
        </div>
      </Card.Content>
    </Card>
  );
}
