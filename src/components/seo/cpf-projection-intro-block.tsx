import { Card, Typography } from "@heroui/react";

const CpfProjectionIntroBlock = () => (
  <section
    aria-labelledby="cpf-projection-intro"
    data-content-block="definition"
  >
    <Card>
      <Card.Header>
        <Card.Title id="cpf-projection-intro">
          How CPF Projection Works
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <Typography>
          The <strong>CPF Projection</strong> tool estimates how your CPF
          balances will grow from now until retirement, based on your current
          age, income, and contribution patterns.
        </Typography>
        <Typography>The projection accounts for:</Typography>
        <ul className="flex flex-col gap-2 text-muted">
          <li>
            <strong>Your CPF contributions</strong>, Employee and employer
            contributions based on your income and age group
          </li>
          <li>
            <strong>Account distribution</strong>, How contributions flow into
            Ordinary Account (OA), Special Account (SA) or Retirement Account
            (RA), and MediSave Account (MA)
          </li>
          <li>
            <strong>Base interest rates</strong>, OA at 2.5%, SA/MA/RA at 4% per
            annum (floor rates for conservative projections)
          </li>
          <li>
            <strong>Extra interest</strong>, Additional 1% on first S$60,000 of
            combined balances, and another 1% on first S$30,000 for members aged
            55 and above
          </li>
          <li>
            <strong>Key milestones</strong>, Age 55 (SA closure, RA creation),
            age 65 (cohort BHS freeze and payout eligibility age)
          </li>
        </ul>
        <Typography>
          The projection does not calculate a personalised CPF LIFE payout. It
          shows CPF Board&apos;s published 2026 Standard Plan reference rows as
          context and links to CPF&apos;s Retirement Payout Planner.
        </Typography>
        <Typography color="muted" type="body-sm">
          Important: This is a SimplyCPF scenario, not a forecast or guarantee.
          Published policy is used where available; later BHS and retirement
          sums are frozen at the latest published value and marked assumed.
        </Typography>
      </Card.Content>
    </Card>
  </section>
);

export default CpfProjectionIntroBlock;
