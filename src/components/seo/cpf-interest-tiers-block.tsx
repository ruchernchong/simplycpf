import { Card } from "@heroui/react";
import {
  CPF_ADDITIONAL_SENIOR_INTEREST_CAP,
  CPF_EXTRA_INTEREST_CAP,
  CPF_EXTRA_INTEREST_RATE,
} from "@/constants/cpf-interest-tiers";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/format";

const CpfInterestTiersBlock = () => (
  <section aria-labelledby="cpf-interest-tiers" data-content-block="definition">
    <Card>
      <Card.Header>
        <Card.Title id="cpf-interest-tiers">
          CPF Extra Interest: How the 1% Bonus Works
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          CPF members earn <strong>extra interest</strong> on top of base rates
          to boost retirement savings. This bonus interest applies to the first
          portion of your combined CPF balances.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="mb-2 font-semibold text-sm">Under Age 55</p>
            <p className="font-bold text-2xl text-foreground">
              +{formatPercentage(CPF_EXTRA_INTEREST_RATE, { decimalPlaces: 0 })}
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              On the first S${formatNumber(CPF_EXTRA_INTEREST_CAP)} of combined
              OA + SA + MA balances
            </p>
            <p className="mt-2 text-muted-foreground text-xs">
              Max extra interest:{" "}
              {formatCurrency(
                CPF_EXTRA_INTEREST_CAP * CPF_EXTRA_INTEREST_RATE,
                0,
              )}{" "}
              per year
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="mb-2 font-semibold text-sm">Age 55 and Above</p>
            <p className="font-bold text-2xl text-foreground">
              +{formatPercentage(CPF_EXTRA_INTEREST_RATE, { decimalPlaces: 0 })}{" "}
              + {CPF_EXTRA_INTEREST_RATE * 100}%
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              Base tier: +
              {formatPercentage(CPF_EXTRA_INTEREST_RATE, { decimalPlaces: 0 })}{" "}
              on first S$
              {formatNumber(CPF_EXTRA_INTEREST_CAP)} of combined balances
              <br />
              Senior tier: Additional +
              {formatPercentage(CPF_EXTRA_INTEREST_RATE, { decimalPlaces: 0 })}{" "}
              on first S${formatNumber(CPF_ADDITIONAL_SENIOR_INTEREST_CAP)} of
              combined balances
            </p>
            <p className="mt-2 text-muted-foreground text-xs">
              Max extra interest:{" "}
              {formatCurrency(
                CPF_EXTRA_INTEREST_CAP * CPF_EXTRA_INTEREST_RATE +
                  CPF_ADDITIONAL_SENIOR_INTEREST_CAP * CPF_EXTRA_INTEREST_RATE,
                0,
              )}{" "}
              per year
            </p>
          </div>
        </div>

        <p className="text-muted-foreground text-sm">
          <strong>How it works:</strong> The extra interest is paid into your
          Special Account (or Retirement Account if you{"'"}re 55+). This means
          your SA/RA grows faster, directly increasing your CPF LIFE payouts in
          retirement.
        </p>

        <p className="text-muted-foreground text-sm">
          <strong>Example:</strong> A 30-year-old with S$50,000 across OA + SA +
          MA earns an extra {formatCurrency(50000 * 0.01, 0)} per year (
          {formatCurrency((50000 * 0.01) / 12, 0)} per month) on top of base
          rates.
        </p>
      </Card.Content>
    </Card>
  </section>
);

export default CpfInterestTiersBlock;
