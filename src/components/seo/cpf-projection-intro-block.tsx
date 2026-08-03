import { Card } from "@heroui/react";

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
        <p>
          The <strong>CPF Projection</strong> tool estimates how your CPF
          balances will grow from now until retirement, based on your current
          age, income, and contribution patterns.
        </p>
        <p>The projection accounts for:</p>
        <ul className="flex flex-col gap-2 text-muted">
          <li>
            <strong>Your CPF contributions</strong>, Employee and employer
            contributions based on your income and age group
          </li>
          <li>
            <strong>Account distribution</strong>, How contributions flow into
            Ordinary Account (OA), Special Account (SA), and MediSave (MA)
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
            age 65 (BHS freeze, CPF LIFE eligibility)
          </li>
        </ul>
        <p>
          The projection also estimates your potential{" "}
          <strong>CPF LIFE monthly payout</strong> based on your projected RA
          balance at age 65. This is an estimate, actual payouts depend on the
          CPF LIFE plan you choose and prevailing annuity factors when you join.
        </p>
        <p className="text-muted text-sm">
          Important: This is a projection, not a guarantee. Actual rates, income
          changes, housing withdrawals, and voluntary top-ups will affect your
          final balances.
        </p>
      </Card.Content>
    </Card>
  </section>
);

export default CpfProjectionIntroBlock;
