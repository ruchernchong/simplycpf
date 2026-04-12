import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CpfDefinitionBlock = () => (
  <section aria-labelledby="cpf-definition" data-content-block="definition">
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle id="cpf-definition">What is CPF?</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p>
          <strong>CPF (Central Provident Fund)</strong> is Singapore{"'"}s
          mandatory social security savings scheme. Every Singapore Citizen and
          Permanent Resident who is employed must contribute a portion of their
          monthly salary to CPF, with their employer also contributing.
        </p>
        <p>
          CPF contributions are distributed across three accounts: the{" "}
          <strong>Ordinary Account (OA)</strong> for housing, insurance,
          investment, and education; the <strong>Special Account (SA)</strong>{" "}
          for retirement and retirement-related investments; and the{" "}
          <strong>MediSave Account (MA)</strong> for healthcare and medical
          insurance.
        </p>
        <p>
          Contribution rates and distribution vary by age group — there are 8
          age brackets with different rates. Income above the CPF income ceiling
          is not subject to CPF contributions.
        </p>
      </CardContent>
    </Card>
  </section>
);

export default CpfDefinitionBlock;
