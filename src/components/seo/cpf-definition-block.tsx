import { Card, Typography } from "@heroui/react";

const CpfDefinitionBlock = () => (
  <section aria-labelledby="cpf-definition" data-content-block="definition">
    <Card>
      <Card.Header>
        <Card.Title id="cpf-definition">What is CPF?</Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <Typography>
          <strong>CPF (Central Provident Fund)</strong> is Singapore{"'"}s
          mandatory social security savings scheme. Every Singapore Citizen and
          Permanent Resident who is employed must contribute a portion of their
          monthly salary to CPF, with their employer also contributing.
        </Typography>
        <Typography>
          CPF contributions are distributed across three accounts: the{" "}
          <strong>Ordinary Account (OA)</strong> for housing, insurance,
          investment, and education; the <strong>Special Account (SA)</strong>{" "}
          for retirement and retirement-related investments; and the{" "}
          <strong>MediSave Account (MA)</strong> for healthcare and medical
          insurance.
        </Typography>
        <Typography>
          Contribution rates and distribution vary by age group, there are 8 age
          brackets with different rates. Income above the CPF income ceiling is
          not subject to CPF contributions.
        </Typography>
      </Card.Content>
    </Card>
  </section>
);

export default CpfDefinitionBlock;
