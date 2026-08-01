import { Card, Chip, Separator, Typography } from "@heroui/react";
import { Fragment } from "react";
import { CPF_POLICY_CATALOGUE } from "@/policy";

export function HomeThreeAges() {
  const lifecycle = CPF_POLICY_CATALOGUE.rules.lifecycleAges;
  const employment = CPF_POLICY_CATALOGUE.rules.statutoryEmploymentAges;
  const deferral = CPF_POLICY_CATALOGUE.cpfLife.payoutStart.deferral;
  const ages: {
    figure: string;
    note?: string;
    label: string;
    body: string;
  }[] = [
    {
      figure: String(lifecycle.retirementAccountCreated),
      label: "Retirement Account opens",
      body: "SA closes. SA then OA savings move to RA up to the applicable retirement sum; withdrawal eligibility depends on CPF's rules.",
    },
    {
      figure: String(employment.retirementAge),
      note: `from ${employment.effectiveDate}`,
      label: "Statutory retirement age",
      body: `The applicable minimum retirement age depends on birth cohort. The published re-employment age for this schedule is ${employment.reEmploymentAge}.`,
    },
    {
      figure: String(lifecycle.cpfLifePayoutEligibility),
      label: "Payout eligibility age",
      body: `Monthly retirement payouts can start. Deferring to ${lifecycle.latestCpfLifePayoutStart} can increase payouts by up to ${deferral.maximumIncreasePerYearPercent}% for each year deferred.`,
    },
  ];

  return (
    <Card>
      <Card.Header className="flex flex-col gap-2">
        <Card.Title>Three ages, and they are not the same age</Card.Title>
        <Card.Description>
          Raising one does not move the others. This is the most common mix-up
          in the current published rules.
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-6 md:flex-row md:gap-8">
        {ages.map((age, index) => (
          <Fragment key={age.figure}>
            {index > 0 && (
              <Separator
                className="hidden self-stretch md:block"
                orientation="vertical"
              />
            )}
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <Typography type="h1">{age.figure}</Typography>
                {age.note && (
                  <Chip size="sm" variant="soft">
                    <Chip.Label>{age.note}</Chip.Label>
                  </Chip>
                )}
              </div>
              <Typography type="body-sm" weight="semibold">
                {age.label}
              </Typography>
              <Typography color="muted" type="body-sm">
                {age.body}
              </Typography>
            </div>
          </Fragment>
        ))}
      </Card.Content>
    </Card>
  );
}
