import { Card, Typography } from "@heroui/react";
import {
  CPF_ADDITIONAL_SENIOR_INTEREST_CAP,
  CPF_EXTRA_INTEREST_CAP,
  CPF_EXTRA_INTEREST_RATE,
} from "@/constants/cpf-interest-tiers";
import { formatNumber } from "@/lib/format";

const CpfInterestTiersBlock = () => (
  <section aria-labelledby="cpf-interest-tiers" data-content-block="definition">
    <Card>
      <Card.Header>
        <Card.Title id="cpf-interest-tiers">
          CPF Extra Interest: How the 1% Bonus Works
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
              OA + SA + MA balances
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
          <strong>How it works:</strong> The extra interest is paid into your
          Special Account (or Retirement Account if you{"'"}re 55+). This means
          your SA/RA grows faster, directly increasing your CPF LIFE payouts in
          retirement.
        </Typography>

        <Typography color="muted" type="body-sm">
          <strong>Example:</strong> A 30-year-old with S$50,000 across OA + SA +
          MA earns an extra S${(50000 * 0.01).toFixed(0)} per year (S$
          {((50000 * 0.01) / 12).toFixed(0)} per month) on top of base rates.
        </Typography>
      </Card.Content>
    </Card>
  </section>
);

export default CpfInterestTiersBlock;
