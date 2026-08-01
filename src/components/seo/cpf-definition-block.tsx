import { Card, Link, Typography } from "@heroui/react";
import { CPF_POLICY_CATALOGUE, resolveContributionSchedule } from "@/policy";

const contributionMetadata =
  CPF_POLICY_CATALOGUE.metadata["cpf-contribution-rates"];
const closureMetadata =
  CPF_POLICY_CATALOGUE.metadata["cpf-special-account-closure"];
const currentSchedule = resolveContributionSchedule(
  contributionMetadata.verifiedAt,
).schedule;
const retirementAge =
  CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;

export default function CpfDefinitionBlock() {
  return (
    <section aria-labelledby="cpf-definition" data-content-block="definition">
      <Card>
        <Card.Header>
          <Card.Title id="cpf-definition">What is CPF?</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <Typography>
            <strong>CPF (Central Provident Fund)</strong> is Singapore{"'"}s
            social security savings scheme. SimplyCPF covers Singapore Citizens
            and Permanent Residents in private-sector, non-pensionable
            employment; for PRs, it supports CPF Board{"'"}s default
            Graduated/Graduated rates. Platform workers, self-employed persons,
            pensionable employees and approved alternative PR arrangements are
            outside scope. Within this scope, employee and employer
            contributions depend on the contribution month, age, wages,
            citizenship and PR year.
          </Typography>
          <Typography>
            Below age {retirementAge}, savings can be held in the{" "}
            <strong>Ordinary Account (OA)</strong>,{" "}
            <strong>Special Account (SA)</strong> and{" "}
            <strong>MediSave Account (MA)</strong>. From age {retirementAge}, a{" "}
            <strong>Retirement Account (RA)</strong> is created and the SA is
            closed; SA savings are transferred to RA up to the applicable Full
            Retirement Sum, with the remainder transferred to OA.
          </Typography>
          <Typography>
            Contribution-rate bands determine the employee and employer shares
            of eligible wages. Allocation-rate bands separately determine how
            each contribution is divided among OA, SA or RA, and MA. Ordinary
            Wages above the applicable monthly ceiling and Additional Wages
            above the remaining annual ceiling do not attract further CPF
            contributions.
          </Typography>
        </Card.Content>
        <Card.Footer className="flex flex-col items-start gap-2">
          <Typography color="muted" type="body-xs">
            Schedule {currentSchedule.effectiveFrom} to{" "}
            {currentSchedule.effectiveTo}; contribution dataset verified{" "}
            {contributionMetadata.verifiedAt}; SA-closure dataset verified{" "}
            {closureMetadata.verifiedAt}.
          </Typography>
          <div className="flex flex-wrap gap-4">
            <Link
              href={contributionMetadata.sources[0]?.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              CPF Board contribution guidance
              <Link.Icon aria-hidden="true" />
            </Link>
            <Link
              href={closureMetadata.sources[0]?.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              CPF Board SA-closure guidance
              <Link.Icon aria-hidden="true" />
            </Link>
          </div>
        </Card.Footer>
      </Card>
    </section>
  );
}
