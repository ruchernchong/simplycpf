import { Card, Chip, Separator, Typography } from "@heroui/react";
import { Fragment } from "react";

const ages: { figure: string; note?: string; label: string; body: string }[] = [
  {
    figure: "55",
    label: "Retirement Account opens",
    body: "SA closes. SA then OA savings move to RA up to the applicable retirement sum; withdrawal eligibility depends on CPF's rules.",
  },
  {
    figure: "64",
    note: "from 1 Jul 2026",
    label: "Statutory retirement age",
    body: "For people born on or after 1 Jul 1963. Earlier cohorts retain retirement ages 62 or 63; the re-employment age is 69.",
  },
  {
    figure: "65",
    label: "Payout eligibility age",
    body: "Monthly retirement payouts can start. Deferring to 70 can increase payouts by up to 7% for each year deferred.",
  },
];

export function HomeThreeAges() {
  return (
    <Card>
      <Card.Header className="flex flex-col gap-2">
        <Card.Title>Three ages, and they are not the same age</Card.Title>
        <Card.Description>
          Raising one does not move the others. This is the most common mix-up
          of 2026.
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
