import { Card, Typography } from "@heroui/react";
import { formatNumber } from "@/lib/format";
import { CPF_POLICY_CATALOGUE } from "@/policy";

export default function CpfProjectionIntroBlock() {
  const interest = CPF_POLICY_CATALOGUE.interestRateMethodology;
  const extra = CPF_POLICY_CATALOGUE.rules.extraInterest;
  const ages = CPF_POLICY_CATALOGUE.rules.lifecycleAges;
  const cpfLifeReference = CPF_POLICY_CATALOGUE.cpfLife.reference;

  return (
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
              <strong>Base interest rates</strong>, OA at{" "}
              {interest.ordinaryAccount.floorRate}% and SA/MA/RA at{" "}
              {interest.specialMediSaveRetirementAccounts.floorRate}% per annum
              (the published floor rates used by this projection)
            </li>
            <li>
              <strong>Extra interest</strong>, Additional{" "}
              {extra.below55.extraPercentagePoints}% on the first S$
              {formatNumber(extra.below55.balanceCap)} of combined balances;
              from age {ages.retirementAccountCreated}, the first S$
              {formatNumber(extra.age55AndAbove.firstTier.balanceCap)} receives
              a further percentage point
            </li>
            <li>
              <strong>Key milestones</strong>, Age{" "}
              {ages.retirementAccountCreated} (SA closure and RA creation), age{" "}
              {ages.cpfLifePayoutEligibility} (cohort BHS freeze and payout
              eligibility age)
            </li>
          </ul>
          <Typography>
            The projection does not calculate a personalised CPF LIFE payout. It
            shows CPF Board&apos;s published {cpfLifeReference.year}{" "}
            {cpfLifeReference.plan} Plan reference rows as context and links to
            CPF&apos;s personalised planner.
          </Typography>
          <Typography color="muted" type="body-sm">
            Important: This is a SimplyCPF scenario, not a forecast or
            guarantee. Published policy is used where available; later BHS and
            retirement sums are frozen at the latest published value and marked
            assumed.
          </Typography>
        </Card.Content>
      </Card>
    </section>
  );
}
