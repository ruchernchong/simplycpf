import { Card } from "@heroui/react";
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
          <p>
            The <strong>Retirement Sums</strong> determine how much you need in
            your CPF Retirement Account (RA) for different levels of CPF LIFE
            payouts. These amounts increase yearly to keep pace with inflation
            and longer life expectancy.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface-tertiary/50 p-4">
              <p className="mb-1 font-semibold text-sm">Basic Retirement Sum</p>
              <p className="font-bold text-2xl text-foreground">
                S${formatNumber(sums.brs)}
              </p>
              <p className="mt-1 text-muted text-xs">
                Minimum for CPF LIFE. Provides basic monthly payouts for life.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-tertiary/50 p-4">
              <p className="mb-1 font-semibold text-sm">Full Retirement Sum</p>
              <p className="font-bold text-2xl text-foreground">
                S${formatNumber(sums.frs)}
              </p>
              <p className="mt-1 text-muted text-xs">
                {frsMultiple}× BRS. Higher monthly payouts for a more
                comfortable retirement.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-tertiary/50 p-4">
              <p className="mb-1 font-semibold text-sm">
                Enhanced Retirement Sum
              </p>
              <p className="font-bold text-2xl text-foreground">
                S${formatNumber(sums.ers)}
              </p>
              <p className="mt-1 text-muted text-xs">
                {ersMultiple}× BRS. Maximum monthly payouts for enhanced
                retirement income.
              </p>
            </div>
          </div>

          {futureYears.length > 0 && (
            <>
              <p className="font-medium">Retirement Sums for Coming Years:</p>
              <ul className="flex flex-col gap-2 text-muted text-sm">
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

          <p className="text-muted text-sm">
            Tip: You can withdraw the amount above your FRS at age 55, or
            transfer it to RA for higher CPF LIFE payouts later.
          </p>
        </Card.Content>
      </Card>
    </section>
  );
};

export default CpfRetirementSumsBlock;
