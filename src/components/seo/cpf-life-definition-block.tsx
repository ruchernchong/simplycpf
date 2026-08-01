import { Card, Typography } from "@heroui/react";
import { CPF_LIFE_AUTO_INCLUSION_BALANCE } from "@/constants/cpf-life";
import {
  CPF_RETIREMENT_SUMS,
  getRetirementSumsForYear,
} from "@/constants/cpf-retirement-sums";
import { formatNumber } from "@/lib/format";

const CpfLifeDefinitionBlock = () => {
  const currentYear = new Date().getFullYear();
  const currentSums = getRetirementSumsForYear(currentYear);

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
            <strong>CPF LIFE</strong> (Lifelong Income For the Elderly) is
            Singapore{"'"}s national annuity scheme that provides retirees with
            a monthly payout for life, no matter how long they live. It ensures
            you will not outlive your retirement savings.
          </Typography>
          <Typography>
            When you turn 65, you can start receiving monthly payouts from your
            CPF LIFE plan. The amount you receive depends on:
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
            If you were born in 1958 or later and have at least{" "}
            <strong>S${formatNumber(CPF_LIFE_AUTO_INCLUSION_BALANCE)}</strong>{" "}
            in your Retirement Account when your payouts begin, you are included
            in CPF LIFE automatically. The Basic Retirement Sum for{" "}
            {currentYear} is S$
            {formatNumber(
              CPF_RETIREMENT_SUMS[currentYear]?.brs ?? currentSums.brs,
            )}
            , but that is the amount you set aside for a given payout level, it
            is not the threshold for joining.
          </Typography>
          <Typography>
            You can defer your payouts up to age 70. Each year you defer
            increases your monthly payout by roughly 7%. If you give no
            instruction, payouts start automatically at 70 on the Standard Plan.
          </Typography>
        </Card.Content>
      </Card>
    </section>
  );
};

export default CpfLifeDefinitionBlock;
