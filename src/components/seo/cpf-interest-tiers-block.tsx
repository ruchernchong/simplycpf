import { Card, Link, Typography } from "@heroui/react";
import { formatNumber } from "@/lib/format";
import { CPF_POLICY_CATALOGUE } from "@/policy";

export default function CpfInterestTiersBlock() {
  const policy = CPF_POLICY_CATALOGUE.rules.extraInterest;
  const below55 = policy.below55;
  const senior = policy.age55AndAbove;
  const retirementAge =
    CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;
  const transactionTiming = CPF_POLICY_CATALOGUE.rules.interestTransactions;
  const under55Maximum =
    below55.balanceCap * (below55.extraPercentagePoints / 100);
  const seniorMaximum =
    senior.firstTier.balanceCap *
      (senior.firstTier.extraPercentagePoints / 100) +
    senior.secondTier.balanceCap *
      (senior.secondTier.extraPercentagePoints / 100);

  return (
    <section
      aria-labelledby="cpf-interest-tiers"
      data-content-block="definition"
    >
      <Card>
        <Card.Header>
          <Card.Title id="cpf-interest-tiers">
            CPF Extra Interest: How the Tiers Work
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <Typography>
            CPF members earn <strong>extra interest</strong> on top of base
            rates on the first portion of their combined CPF balances.
          </Typography>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface-secondary p-4">
              <Typography type="body-sm" weight="semibold">
                Under age {retirementAge}
              </Typography>
              <Typography type="h3" weight="bold">
                +{below55.extraPercentagePoints}%
              </Typography>
              <Typography color="muted" type="body-sm">
                On the first S${formatNumber(below55.balanceCap)} of combined
                balances, with no more than S$
                {formatNumber(policy.ordinaryAccountCap)} from OA
              </Typography>
              <Typography color="muted" type="body-xs">
                Maximum extra interest at the stated caps: S$
                {formatNumber(under55Maximum)} a year
              </Typography>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface-secondary p-4">
              <Typography type="body-sm" weight="semibold">
                Age {retirementAge} and above
              </Typography>
              <Typography type="h3" weight="bold">
                +{senior.firstTier.extraPercentagePoints}% then +
                {senior.secondTier.extraPercentagePoints}%
              </Typography>
              <Typography color="muted" type="body-sm">
                +{senior.firstTier.extraPercentagePoints}% on the first S$
                {formatNumber(senior.firstTier.balanceCap)}, then +
                {senior.secondTier.extraPercentagePoints}% on the next S$
                {formatNumber(senior.secondTier.balanceCap)}
              </Typography>
              <Typography color="muted" type="body-xs">
                Maximum extra interest at the stated caps: S$
                {formatNumber(seniorMaximum)} a year
              </Typography>
            </div>
          </div>

          <Typography color="muted" type="body-sm">
            <strong>Balance order:</strong> CPF Board counts RA first (including
            any CPF LIFE premium balance), then OA up to S$
            {formatNumber(policy.ordinaryAccountCap)}, SA, and MA. Extra
            interest earned on OA goes to {below55.oaExtraInterestCreditedTo}{" "}
            below {retirementAge} or {senior.oaExtraInterestCreditedTo} from{" "}
            {retirementAge}; extra interest earned on the other accounts stays
            in the respective account.
          </Typography>

          <Typography color="muted" type="body-sm">
            CPF interest is computed {transactionTiming.computation} and
            credited {transactionTiming.crediting}. Fresh inflows start earning
            in the {transactionTiming.freshInflowsStartEarning}; withdrawals
            stop earning in the {transactionTiming.withdrawalsStopEarning}.
          </Typography>

          <Link
            href={policy.sourceUrls[0]}
            rel="noopener noreferrer"
            target="_blank"
          >
            CPF Board extra-interest rules
            <Link.Icon aria-hidden="true" />
          </Link>
        </Card.Content>
      </Card>
    </section>
  );
}
