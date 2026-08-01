import { Card, Typography } from "@heroui/react";
import {
  CPF_RETIREMENT_SUMS,
  getRetirementSumsForYear,
} from "@/constants/cpf-retirement-sums";
import { formatNumber } from "@/lib/format";

const CpfRetirementSumsBlock = () => {
  const currentYear = new Date().getFullYear();
  const sums = getRetirementSumsForYear(currentYear);

  // Derived rather than hardcoded: the ERS moved from 3x to 4x the BRS in 2025.
  const frsMultiple = Math.round(sums.frs / sums.brs);
  const ersMultiple = Math.round(sums.ers / sums.brs);

  // Find next few years with data for projections
  const futureYears = Object.keys(CPF_RETIREMENT_SUMS)
    .map(Number)
    .filter((y) => y > currentYear)
    .slice(0, 3);

  return (
    <section aria-labelledby="cpf-retirement-sums" data-content-block="dataset">
      <Card>
        <Card.Header>
          <Card.Title id="cpf-retirement-sums">
            CPF Retirement Sums ({currentYear})
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <Typography>
            The <strong>Retirement Sums</strong> are reference amounts used when
            setting aside savings in your Retirement Account (RA). The amount
            set aside affects retirement payouts, but none of these sums is a
            minimum balance for receiving a payout.
          </Typography>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <Typography className="mb-1" type="body-sm" weight="semibold">
                Basic Retirement Sum
              </Typography>
              <Typography type="h3" weight="bold">
                S${formatNumber(sums.brs)}
              </Typography>
              <Typography className="mt-1" color="muted" type="body-xs">
                A reference sum for members who meet CPF&apos;s property-related
                conditions; not a CPF LIFE joining minimum.
              </Typography>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <Typography className="mb-1" type="body-sm" weight="semibold">
                Full Retirement Sum
              </Typography>
              <Typography type="h3" weight="bold">
                S${formatNumber(sums.frs)}
              </Typography>
              <Typography className="mt-1" color="muted" type="body-xs">
                {frsMultiple}× BRS. The default amount set aside in RA at age
                55 when sufficient savings are available.
              </Typography>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <Typography className="mb-1" type="body-sm" weight="semibold">
                Enhanced Retirement Sum
              </Typography>
              <Typography type="h3" weight="bold">
                S${formatNumber(sums.ers)}
              </Typography>
              <Typography className="mt-1" color="muted" type="body-xs">
                {ersMultiple}× BRS. The prevailing maximum to which eligible
                members can top up RA for higher retirement payouts.
              </Typography>
            </div>
          </div>

          {futureYears.length > 0 && (
            <>
              <Typography weight="medium">
                Retirement Sums for Coming Years:
              </Typography>
              <ul className="flex flex-col gap-2 text-muted-foreground text-sm">
                {futureYears.map((year) => {
                  const yearSums = getRetirementSumsForYear(year);
                  return (
                    <li key={year}>
                      <strong>{year}:</strong> BRS S$
                      {formatNumber(yearSums.brs)}, FRS S$
                      {formatNumber(yearSums.frs)}, ERS S$
                      {formatNumber(yearSums.ers)}
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <Typography color="muted" type="body-sm">
            Withdrawal at 55 depends on the amount set aside, property-related
            conditions and other CPF withdrawal rules. Amounts left in CPF
            continue earning the applicable interest.
          </Typography>
        </Card.Content>
      </Card>
    </section>
  );
};

export default CpfRetirementSumsBlock;
