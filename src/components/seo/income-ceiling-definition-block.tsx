import { Card } from "@heroui/react";

const IncomeCeilingDefinitionBlock = () => (
  <section
    aria-labelledby="income-ceiling-definition"
    data-content-block="definition"
  >
    <Card>
      <Card.Header>
        <Card.Title id="income-ceiling-definition">
          What is the CPF Income Ceiling?
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          The <strong>CPF income ceiling</strong> is the maximum amount of
          monthly salary subject to CPF contributions. Any income above this
          ceiling is not subject to CPF, meaning both employee and employer do
          not pay CPF on the excess amount.
        </p>
        <p>
          Following Singapore{"'"}s Budget 2023, the CPF income ceiling is
          rising progressively from <strong>S$6,000</strong> (pre-September
          2023) to <strong>S$8,000</strong> (January 2026) in stages:
        </p>
        <ul className="flex flex-col gap-2 text-muted">
          <li>September 2023: S$6,000 → S$6,300</li>
          <li>January 2024: S$6,300 → S$6,800</li>
          <li>January 2025: S$6,800 → S$7,400</li>
          <li>January 2026: S$7,400 → S$8,000</li>
        </ul>
        <p>
          For higher-income earners, each ceiling increase means more of their
          salary becomes subject to CPF contributions. While take-home pay
          decreases slightly, total retirement savings (including employer
          contributions) increase.
        </p>
      </Card.Content>
    </Card>
  </section>
);

export default IncomeCeilingDefinitionBlock;
