import { Card, Link, Typography } from "@heroui/react";
import { formatNumber } from "@/lib/format";
import { CPF_POLICY_CATALOGUE } from "@/policy";

export default function CpfLifeDefinitionBlock() {
  const policy = CPF_POLICY_CATALOGUE.cpfLife;
  const inclusion = policy.automaticInclusion;
  const payoutStart = policy.payoutStart;

  return (
    <section
      aria-labelledby="cpf-life-definition"
      data-content-block="definition"
    >
      <Card>
        <Card.Header>
          <Card.Title id="cpf-life-definition">What is CPF LIFE?</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <Typography>
            <strong>CPF LIFE</strong> (Lifelong Income For the Elderly) provides
            monthly payouts for life. Personalised payout calculations remain
            with CPF Board.
          </Typography>
          <Typography>
            From age {payoutStart.earliestAge}, you can start receiving monthly
            payouts. The amount depends on:
          </Typography>
          <ul className="flex flex-col gap-2 text-muted">
            <li>
              <strong>Your Retirement Account balance</strong>, built from CPF
              savings and top-ups
            </li>
            <li>
              <strong>The plan you choose</strong>, Standard, Escalating, or
              Basic
            </li>
            <li>
              <strong>When you start payouts</strong>, up to the published
              latest starting age of {payoutStart.latestAge}
            </li>
          </ul>
          <Typography>
            Singapore Citizens and Permanent Residents born from{" "}
            {inclusion.bornOnOrAfter.slice(0, 4)} with at least{" "}
            <strong>
              S$${formatNumber(inclusion.minimumRetirementSavingsAtPayoutStart)}
            </strong>{" "}
            in retirement savings when payouts start are included automatically.
            That amount is an automatic-inclusion condition, not a minimum
            joining balance or minimum payout balance.
          </Typography>
          <Typography>
            CPF Board states that deferring payouts can increase them by up to{" "}
            {payoutStart.deferral.maximumIncreasePerYearPercent}% for each year,
            up to {payoutStart.deferral.maximumCumulativeIncreasePercent}% over{" "}
            {payoutStart.deferral.maximumDeferralYears} years.
          </Typography>
          <Link
            href={policy.sourceUrls[0]}
            rel="noopener noreferrer"
            target="_blank"
          >
            CPF Board CPF LIFE guidance
            <Link.Icon aria-hidden="true" />
          </Link>
        </Card.Content>
      </Card>
    </section>
  );
}
