import { Card, Link, Typography } from "@heroui/react";
import { formatNumber } from "@/lib/format";
import { CPF_POLICY_CATALOGUE } from "@/policy";

export default function CpfTopUpLimitsBlock() {
  const policy = CPF_POLICY_CATALOGUE.rules.retirementTopUps;
  const relief = policy.taxRelief;
  const capacity = policy.actualCapacity;
  const mrss = policy.matchedRetirementSavingsScheme;
  const retirementAge =
    CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;

  return (
    <section
      aria-labelledby="cpf-top-up-limits"
      data-content-block="definition"
    >
      <Card>
        <Card.Header>
          <Card.Title id="cpf-top-up-limits">
            CPF Top-Up Capacity and Tax Relief
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <Typography>
            The amount you can actually top up and the amount eligible for tax
            relief are different limits. SimplyCPF keeps them separate.
          </Typography>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface-secondary p-4">
              <Typography type="body-sm" weight="semibold">
                Cash top-up to your own retirement savings
              </Typography>
              <Typography type="h3" weight="bold">
                Relief up to S$${formatNumber(relief.selfAnnualCap)}
              </Typography>
              <Typography color="muted" type="body-xs">
                Cash goes to {capacity.below55Account} below age {retirementAge}{" "}
                or {capacity.from55Account} from age {retirementAge}. The actual
                top-up capacity is governed by the applicable retirement-sum
                limit, not this tax-relief cap.
              </Typography>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface-secondary p-4">
              <Typography type="body-sm" weight="semibold">
                Cash top-up for eligible family members
              </Typography>
              <Typography type="h3" weight="bold">
                Relief up to S$${formatNumber(relief.familyAnnualCap)}
              </Typography>
              <Typography color="muted" type="body-xs">
                This is a separate annual relief category. Recipient eligibility
                and the available top-up capacity still apply.
              </Typography>
            </div>
          </div>

          <Typography>
            <strong>Actual top-up capacity:</strong>
          </Typography>
          <ul className="flex flex-col gap-2 text-muted text-sm">
            <li>
              Below age {retirementAge}: {capacity.below55Limit}.
            </li>
            <li>
              From age {retirementAge}: {capacity.from55Limit}.
            </li>
            <li>
              The available amount can therefore be lower or higher than the
              annual tax-relief cap.
            </li>
          </ul>

          <Typography>
            <strong>Tax-relief conditions:</strong>
          </Typography>
          <ul className="flex flex-col gap-2 text-muted text-sm">
            <li>
              Maximum combined cash top-up relief: S$
              {formatNumber(relief.combinedAnnualCap)} per year across the two
              categories.
            </li>
            <li>
              For a spouse or sibling, the published preceding-year income
              condition is S$
              {formatNumber(relief.spouseOrSiblingIncomeCondition)}.
            </li>
            <li>
              CPF transfers do {relief.cpfTransfersQualify ? "" : "not "}
              qualify for cash top-up relief.
            </li>
            <li>
              All personal income-tax reliefs remain subject to the overall S$
              {formatNumber(relief.overallPersonalReliefCap)} cap.
            </li>
          </ul>

          <Typography>
            <strong>Matched Retirement Savings Scheme:</strong>
          </Typography>
          <ul className="flex flex-col gap-2 text-muted text-sm">
            <li>
              The separate matching grant is capped at S$
              {formatNumber(mrss.annualMatchingGrantCap)} a year and S$
              {formatNumber(mrss.lifetimeMatchingGrantCap)} over a lifetime,
              subject to CPF Board eligibility.
            </li>
            <li>
              Qualifying top-ups that receive the matching grant do not also
              receive cash top-up tax relief.
            </li>
          </ul>

          <Typography color="muted" type="body-sm">
            Retirement top-ups are irreversible and are reserved for retirement
            payouts under the applicable CPF rules. Verify your personal
            capacity and tax position with CPF Board and IRAS before
            transferring funds.
          </Typography>

          <div className="flex flex-wrap gap-4">
            <Link
              href={policy.sourceUrls[0]}
              rel="noopener noreferrer"
              target="_blank"
            >
              CPF Board top-up rules
              <Link.Icon aria-hidden="true" />
            </Link>
            <Link
              href={policy.sourceUrls[2]}
              rel="noopener noreferrer"
              target="_blank"
            >
              IRAS cash top-up relief
              <Link.Icon aria-hidden="true" />
            </Link>
          </div>
        </Card.Content>
      </Card>
    </section>
  );
}
