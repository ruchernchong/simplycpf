import { Card } from "@heroui/react";
import { KPI } from "@heroui-pro/react";
import {
  CPF_ADDITIONAL_SENIOR_INTEREST_CAP,
  CPF_EXTRA_INTEREST_CAP,
  CPF_EXTRA_INTEREST_RATE,
} from "@/constants/cpf-interest-tiers";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/format";

function CpfInterestTiersBlock() {
  return (
    <section
      aria-labelledby="cpf-interest-tiers"
      data-content-block="definition"
    >
      <Card>
        <Card.Header>
          <Card.Title id="cpf-interest-tiers">
            CPF Extra Interest: How the 1% Bonus Works
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <p>
            CPF members earn <strong>extra interest</strong> on top of base
            rates to boost retirement savings. This bonus interest applies to
            the first portion of your combined CPF balances.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <KPI className="gap-2">
              <KPI.Header>
                <KPI.Title className="font-semibold text-sm">
                  Under Age 55
                </KPI.Title>
              </KPI.Header>
              <KPI.Content>
                <KPI.Value
                  className="font-bold text-2xl text-foreground"
                  locale="en-SG"
                  maximumFractionDigits={0}
                  signDisplay="always"
                  style="percent"
                  value={CPF_EXTRA_INTEREST_RATE}
                />
              </KPI.Content>
              <KPI.Footer className="flex flex-col gap-2 text-muted text-sm">
                <span>
                  On the first S${formatNumber(CPF_EXTRA_INTEREST_CAP)} of
                  combined OA + SA + MA balances
                </span>
                <span className="text-xs">
                  Max extra interest:{" "}
                  {formatCurrency(
                    CPF_EXTRA_INTEREST_CAP * CPF_EXTRA_INTEREST_RATE,
                    0,
                  )}{" "}
                  per year
                </span>
              </KPI.Footer>
            </KPI>
            <KPI className="gap-2">
              <KPI.Header>
                <KPI.Title className="font-semibold text-sm">
                  Age 55 and Above
                </KPI.Title>
              </KPI.Header>
              <KPI.Content>
                <div className="flex items-baseline gap-2">
                  <KPI.Value
                    className="font-bold text-2xl text-foreground"
                    locale="en-SG"
                    maximumFractionDigits={0}
                    signDisplay="always"
                    style="percent"
                    value={CPF_EXTRA_INTEREST_RATE}
                  />
                  <span
                    aria-hidden="true"
                    className="font-bold text-2xl text-foreground"
                  >
                    +
                  </span>
                  <KPI.Value
                    className="font-bold text-2xl text-foreground"
                    locale="en-SG"
                    maximumFractionDigits={0}
                    signDisplay="always"
                    style="percent"
                    value={CPF_EXTRA_INTEREST_RATE}
                  />
                </div>
              </KPI.Content>
              <KPI.Footer className="flex flex-col gap-2 text-muted text-sm">
                <span>
                  Base tier: +
                  {formatPercentage(CPF_EXTRA_INTEREST_RATE, {
                    decimalPlaces: 0,
                  })}{" "}
                  on first S${formatNumber(CPF_EXTRA_INTEREST_CAP)} of combined
                  balances
                  <br />
                  Senior tier: Additional +
                  {formatPercentage(CPF_EXTRA_INTEREST_RATE, {
                    decimalPlaces: 0,
                  })}{" "}
                  on first S${formatNumber(CPF_ADDITIONAL_SENIOR_INTEREST_CAP)}{" "}
                  of combined balances
                </span>
                <span className="text-xs">
                  Max extra interest:{" "}
                  {formatCurrency(
                    CPF_EXTRA_INTEREST_CAP * CPF_EXTRA_INTEREST_RATE +
                      CPF_ADDITIONAL_SENIOR_INTEREST_CAP *
                        CPF_EXTRA_INTEREST_RATE,
                    0,
                  )}{" "}
                  per year
                </span>
              </KPI.Footer>
            </KPI>
          </div>

          <p className="text-muted text-sm">
            <strong>How it works:</strong> The extra interest is paid into your
            Special Account (or Retirement Account if you{"'"}re 55+). This
            means your SA/RA grows faster, directly increasing your CPF LIFE
            payouts in retirement.
          </p>

          <p className="text-muted text-sm">
            <strong>Example:</strong> A 30-year-old with S$50,000 across OA + SA
            + MA earns an extra {formatCurrency(50000 * 0.01, 0)} per year (
            {formatCurrency((50000 * 0.01) / 12, 0)} per month) on top of base
            rates.
          </p>
        </Card.Content>
      </Card>
    </section>
  );
}

export default CpfInterestTiersBlock;
