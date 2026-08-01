import { Card, Typography } from "@heroui/react";
import {
  CPF_ADDITIONAL_SENIOR_INTEREST_CAP,
  CPF_EXTRA_INTEREST_CAP,
  CPF_EXTRA_INTEREST_RATE,
  CPF_OA_EXTRA_INTEREST_CAP,
} from "@/constants/cpf-interest-tiers";
import { formatNumber } from "@/lib/format";

const CpfInterestTiersBlock = () => (
  <section aria-labelledby="cpf-interest-tiers" data-content-block="definition">
    <Card>
      <Card.Header>
        <Card.Title id="cpf-interest-tiers">
          CPF Extra Interest: How the Tiers Work
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <Typography>
          CPF members earn <strong>extra interest</strong> on top of base rates
          to boost retirement savings. This bonus interest applies to the first
          portion of your combined CPF balances.
        </Typography>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface-secondary p-4">
            <Typography className="mb-2" type="body-sm" weight="semibold">
              Under Age 55
            </Typography>
            <Typography type="h3" weight="bold">
              +{CPF_EXTRA_INTEREST_RATE * 100}%
            </Typography>
            <Typography className="mt-1" color="muted" type="body-sm">
              On the first S${formatNumber(CPF_EXTRA_INTEREST_CAP)} of combined
              balances, with no more than S$
              {formatNumber(CPF_OA_EXTRA_INTEREST_CAP)} from OA
            </Typography>
            <Typography className="mt-2" color="muted" type="body-xs">
              Max extra interest: S$
              {(CPF_EXTRA_INTEREST_CAP * CPF_EXTRA_INTEREST_RATE).toFixed(0)}{" "}
              per year
            </Typography>
          </div>
          <div className="rounded-2xl border border-border bg-surface-secondary p-4">
            <Typography className="mb-2" type="body-sm" weight="semibold">
              Age 55 and Above
            </Typography>
            <Typography type="h3" weight="bold">
              +{CPF_EXTRA_INTEREST_RATE * 100}% +{" "}
              {CPF_EXTRA_INTEREST_RATE * 100}%
            </Typography>
            <Typography className="mt-1" color="muted" type="body-sm">
              Base tier: +{CPF_EXTRA_INTEREST_RATE * 100}% on first S$
              {formatNumber(CPF_EXTRA_INTEREST_CAP)} of combined balances
              <br />
              Senior tier: Additional +{CPF_EXTRA_INTEREST_RATE * 100}% on first
              S${formatNumber(CPF_ADDITIONAL_SENIOR_INTEREST_CAP)} of combined
              balances
            </Typography>
            <Typography className="mt-2" color="muted" type="body-xs">
              Max extra interest: S$
              {(
                CPF_EXTRA_INTEREST_CAP * CPF_EXTRA_INTEREST_RATE +
                CPF_ADDITIONAL_SENIOR_INTEREST_CAP * CPF_EXTRA_INTEREST_RATE
              ).toFixed(0)}{" "}
              per year
            </Typography>
          </div>
        </div>

        <Typography color="muted" type="body-sm">
          <strong>Balance order:</strong> CPF Board counts RA first (including
          any CPF LIFE premium balance), then OA up to S$
          {formatNumber(CPF_OA_EXTRA_INTEREST_CAP)}, SA, and MA. Extra interest
          earned on OA goes to SA below 55 or RA from 55; extra interest earned
          on the other accounts stays in the respective account.
        </Typography>

        <Typography color="muted" type="body-sm">
          CPF interest is computed monthly and credited annually. Transactions
          during a month affect which balances earn interest, so a simple annual
          percentage multiplication is not always the credited amount.
        </Typography>
      </Card.Content>
    </Card>
  </section>
);

export default CpfInterestTiersBlock;
