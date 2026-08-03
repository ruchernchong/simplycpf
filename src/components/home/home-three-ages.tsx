import { Card, Chip, Separator, Typography } from "@heroui/react";
import { Fragment } from "react";

const ages: { figure: string; note?: string; label: string; body: string }[] = [
  {
    figure: "55",
    label: "Retirement Account opens",
    body: "SA closes. Savings above your Full Retirement Sum become withdrawable. Nothing forces you to stop working.",
  },
  {
    figure: "64",
    note: "from 1 Jul 2026",
    label: "Statutory retirement age",
    body: "The earliest your employer may ask you to retire. Re-employment age rises to 69. This has no effect on CPF payouts.",
  },
  {
    figure: "65",
    label: "Payout eligibility age",
    body: "CPF LIFE payouts can start. You may defer to 70 for higher monthly payouts. Unchanged in 2026.",
  },
];

export function HomeThreeAges() {
  return (
    <Card>
      <Card.Header className="flex flex-col gap-2">
        <Card.Title className="font-semibold text-base tracking-tight">
          Three ages, and they are not the same age
        </Card.Title>
        <Card.Description className="text-muted text-sm">
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
              <span className="flex items-baseline gap-2">
                <span className="font-semibold text-[34px] tracking-tight">
                  {age.figure}
                </span>
                {age.note && (
                  <Chip size="sm" variant="soft">
                    <Chip.Label>{age.note}</Chip.Label>
                  </Chip>
                )}
              </span>
              <span className="font-semibold text-sm">{age.label}</span>
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
