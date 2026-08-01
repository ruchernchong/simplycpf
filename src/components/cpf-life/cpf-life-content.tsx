import { Card, Chip, Link, Table, Typography } from "@heroui/react";
import { CPF_LIFE_2026_REFERENCE } from "@/constants/cpf-life";
import { formatCurrency } from "@/lib/format";
import { CPF_LIFE_POLICY, CPF_POLICY_RULES } from "@/policy";

const planCharacteristics = [
  {
    name: "Standard Plan",
    summary: CPF_LIFE_POLICY.plans.standard.payoutPattern,
    description: `Provides a steady monthly payout for life. It ${CPF_LIFE_POLICY.plans.standard.growsWithInflation ? "grows" : "does not automatically grow"} with inflation.`,
  },
  {
    name: "Escalating Plan",
    summary: CPF_LIFE_POLICY.plans.escalating.payoutPattern,
    description: `Starts lower and grows by ${CPF_LIFE_POLICY.plans.escalating.annualIncreasePercent}% each year for life.`,
  },
  {
    name: "Basic Plan",
    summary: CPF_LIFE_POLICY.plans.basic.payoutPattern,
    description: `Payouts become progressively lower once combined CPF balances fall below ${formatCurrency(CPF_LIFE_POLICY.plans.basic.declineCondition.combinedCpfBalancesBelow, 0)}, because ${CPF_LIFE_POLICY.plans.basic.declineCondition.reason}.`,
  },
] as const;

function money(value: number): string {
  return formatCurrency(value, 0);
}

export function CpfLifeContent() {
  const reference = CPF_LIFE_2026_REFERENCE;
  const retirementAccountAge =
    CPF_POLICY_RULES.lifecycleAges.retirementAccountCreated;
  const payoutEligibilityAge = CPF_LIFE_POLICY.payoutStart.earliestAge;
  const latestPayoutStartAge = CPF_LIFE_POLICY.payoutStart.latestAge;

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <Card.Header>
          <div className="flex flex-wrap items-center gap-2">
            <Card.Title>
              CPF Board&apos;s {reference.referenceYear} payout reference
            </Card.Title>
            <Chip size="sm" variant="soft">
              Official reference rows
            </Chip>
          </div>
          <Card.Description>
            Exact CPF Board figures for a male member on the CPF LIFE Standard
            Plan. They are reference examples, not a personalised estimate.
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-6">
          <Table variant="secondary">
            <Table.ScrollContainer>
              <Table.Content
                aria-label={`CPF Board ${reference.referenceYear} CPF LIFE Standard Plan reference payouts`}
                className="min-w-[680px]"
              >
                <Table.Header>
                  <Table.Column isRowHeader>
                    RA at age {retirementAccountAge}
                  </Table.Column>
                  <Table.Column className="text-right">
                    RA at age {payoutEligibilityAge}
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
                      <Table.Cell>
                        <div className="flex flex-col gap-1">
                          <span>{money(row.raAt55)}</span>
                          {row.label ? (
                            <span className="text-muted text-xs">
                              {row.label}
                            </span>
                          ) : null}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        {money(row.raAt65)}
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        {money(row.monthlyPayoutAt65)}
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        {money(row.monthlyPayoutAt70)}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>

          <Typography color="muted" type="body-xs">
            CPF Board says the figures may be adjusted for long-term changes in
            interest rates or life expectancy. Actual payouts depend on the
            member&apos;s circumstances and prevailing CPF LIFE parameters.
          </Typography>

          <div className="flex flex-wrap gap-4">
            <Link href={reference.sourceUrl} target="_blank">
              View the official reference table
            </Link>
            <Link href={reference.personalisedEstimatorUrl} target="_blank">
              Use CPF&apos;s Retirement Payout Planner
            </Link>
          </div>
        </Card.Content>
      </Card>

      <div className="grid gap-8 md:grid-cols-3">
        {planCharacteristics.map((plan) => (
          <Card key={plan.name}>
            <Card.Header>
              <Card.Title>{plan.name}</Card.Title>
              <Card.Description>{plan.summary}</Card.Description>
            </Card.Header>
            <Card.Content>
              <Typography type="body-sm">{plan.description}</Typography>
            </Card.Content>
          </Card>
        ))}
      </div>

      <Card>
        <Card.Header>
          <Card.Title>Why SimplyCPF does not estimate your payout</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <Typography type="body-sm">
            CPF LIFE payouts depend on your Retirement Account balance when you
            join, your payout start age, prevailing interest and mortality
            assumptions, and personal characteristics. A proportional factor or
            plan ratio would turn CPF Board&apos;s examples into an invented
            quote.
          </Typography>
          <Typography color="muted" type="body-sm">
            The{" "}
            {formatCurrency(
              CPF_LIFE_POLICY.automaticInclusion
                .minimumRetirementSavingsAtPayoutStart,
              0,
            )}{" "}
            figure used in CPF LIFE automatic-inclusion rules is not a minimum
            joining balance and is not a threshold below which monthly payouts
            become zero.
          </Typography>
        </Card.Content>
      </Card>
    </div>
  );
}

export default CpfLifeContent;
