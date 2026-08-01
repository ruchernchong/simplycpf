import { Card, Typography } from "@heroui/react";
import { formatNumber } from "@/lib/format";
import { CPF_POLICY_CATALOGUE } from "@/policy";

export default function CpfProjectionIntroBlock() {
  const interest = CPF_POLICY_CATALOGUE.interestRateMethodology;
  const extra = CPF_POLICY_CATALOGUE.rules.extraInterest;
  const ages = CPF_POLICY_CATALOGUE.rules.lifecycleAges;
  const cpfLifeReference = CPF_POLICY_CATALOGUE.cpfLife.reference;
  const latestInterest = CPF_POLICY_CATALOGUE.quarterlyInterestRates.at(-1);

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
            balances may grow from the selected start month, based on the OA,
            SA, MA and RA balances at the opening of that month, your birth
            month, and a fixed monthly Ordinary Wage assumption.
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
              <strong>Base interest rates</strong>, CPF Board&apos;s published
              quarterly declarations through{" "}
              {latestInterest?.quarter ?? "the latest loaded quarter"}; later
              months use the official OA {interest.ordinaryAccount.floorRate}%
              and SA/MA/RA{" "}
              {interest.specialMediSaveRetirementAccounts.floorRate}% floors as
              an explicit SimplyCPF assumption
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
              {ages.basicHealthcareSumFrozen} (cohort BHS freeze); CPF LIFE
              payout eligibility is tracked separately from age{" "}
              {ages.cpfLifePayoutEligibility}
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
