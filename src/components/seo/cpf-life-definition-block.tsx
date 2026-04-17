import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CPF_RETIREMENT_SUMS,
  getRetirementSumsForYear,
} from "@/constants/cpf-retirement-sums";

const CpfLifeDefinitionBlock = () => {
  const currentYear = new Date().getFullYear();
  const currentSums = getRetirementSumsForYear(currentYear);

  return (
    <section
      aria-labelledby="cpf-life-definition"
      data-content-block="definition"
    >
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle id="cpf-life-definition">What is CPF LIFE?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p>
            <strong>CPF LIFE</strong> (Lifelong Income For the Elderly) is
            Singapore{"'"}s national annuity scheme that provides retirees with
            a monthly payout for life, no matter how long they live. It ensures
            you will not outlive your retirement savings.
          </p>
          <p>
            When you turn 65, you can start receiving monthly payouts from your
            CPF LIFE plan. The amount you receive depends on:
          </p>
          <ul className="flex flex-col gap-2 text-muted-foreground">
            <li>
              <strong>Your Retirement Account (RA) balance</strong> — built from
              CPF savings and top-ups
            </li>
            <li>
              <strong>The CPF LIFE plan you choose</strong> — Standard,
              Escalating, or Basic
            </li>
            <li>
              <strong>When you start payouts</strong> — deferring to age 70
              gives higher monthly amounts
            </li>
          </ul>
          <p>
            To join CPF LIFE, you need at least{" "}
            <strong>
              S$
              {(
                CPF_RETIREMENT_SUMS[currentYear]?.brs || currentSums.brs
              ).toLocaleString()}
            </strong>{" "}
            in your Retirement Account (the Basic Retirement Sum for{" "}
            {currentYear}).
          </p>
          <p>
            You can defer your payouts up to age 70. Each year you defer
            increases your monthly payout by about 7% per annum — meaning a 35%
            increase if you defer from 65 to 70.
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default CpfLifeDefinitionBlock;
