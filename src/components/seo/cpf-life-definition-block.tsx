import { Card, Typography } from "@heroui/react";
import {
  CPF_LIFE_AUTO_INCLUSION_BALANCE,
  CPF_LIFE_LATEST_PAYOUT_AGE,
  CPF_LIFE_PAYOUT_ELIGIBILITY_AGE,
} from "@/constants/cpf-life";
import { formatNumber } from "@/lib/format";

const CpfLifeDefinitionBlock = () => (
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
            <strong>CPF LIFE</strong> (Lifelong Income For the Elderly) is
            Singapore{"'"}s national annuity scheme that provides retirees with
            a monthly payout for life, no matter how long they live. It ensures
            you will not outlive your retirement savings.
          </Typography>
          <Typography>
            From age {CPF_LIFE_PAYOUT_ELIGIBILITY_AGE}, you can start receiving
            monthly payouts. The amount you receive depends on:
          </Typography>
          <ul className="flex flex-col gap-2 text-muted-foreground">
            <li>
              <strong>Your Retirement Account (RA) balance</strong>, built from
              CPF savings and top-ups
            </li>
            <li>
              <strong>The CPF LIFE plan you choose</strong>, Standard,
              Escalating, or Basic
            </li>
            <li>
              <strong>When you start payouts</strong>, deferring to age 70 gives
              higher monthly amounts
            </li>
          </ul>
          <Typography>
            If you are a Singapore Citizen or Permanent Resident, were born in
            1958 or later, and have at least{" "}
            <strong>S${formatNumber(CPF_LIFE_AUTO_INCLUSION_BALANCE)}</strong>{" "}
            in retirement savings when monthly payouts start, you are included
            automatically. This S$60,000 condition is not a minimum joining
            balance: eligible members who are not automatically included may
            still choose to join CPF LIFE.
          </Typography>
          <Typography>
            You can defer payouts up to age {CPF_LIFE_LATEST_PAYOUT_AGE}. CPF
            Board says payouts increase by up to 7% for each year deferred, up
            to 35% over five years.
          </Typography>
        </Card.Content>
      </Card>
    </section>
);

export default CpfLifeDefinitionBlock;
