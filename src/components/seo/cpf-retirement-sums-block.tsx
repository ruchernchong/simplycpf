import { Card, Typography } from "@heroui/react";
import { formatNumber } from "@/lib/format";
import { CPF_POLICY_CATALOGUE } from "@/policy";

export default function CpfRetirementSumsBlock() {
  const verifiedAt =
    CPF_POLICY_CATALOGUE.metadata["cpf-retirement-sums"].verifiedAt;
  const retirementAge =
    CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;
  const sums = CPF_POLICY_CATALOGUE.retirementSums.find(
    (row) => verifiedAt >= row.effectiveFrom && verifiedAt <= row.effectiveTo,
  );
  if (!sums) throw new Error("Current CPF retirement sums are unavailable.");

  const frsMultiple = Math.round(sums.frs / sums.brs);
  const futureRows = CPF_POLICY_CATALOGUE.retirementSums.filter(
    (row) => row.year > sums.year,
  );

  return (
    <section aria-labelledby="cpf-retirement-sums" data-content-block="dataset">
      <Card>
        <Card.Header>
          <Card.Title id="cpf-retirement-sums">
            CPF Retirement Sums ({sums.year})
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
                {frsMultiple}× BRS. The default amount set aside in RA at age{" "}
                {retirementAge} when sufficient savings are available.
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
                {sums.ersMultipleOfBrs}× BRS. The prevailing maximum to which
                eligible members can top up RA for higher retirement payouts.
              </Typography>
            </div>
          </div>

          {futureRows.length > 0 && (
            <>
              <Typography weight="medium">
                Retirement Sums for Coming Years:
              </Typography>
              <ul className="flex flex-col gap-2 text-muted-foreground text-sm">
                {futureRows.map((row) => (
                  <li key={row.year}>
                    <strong>{row.year}:</strong> BRS S$
                    {formatNumber(row.brs)}, FRS S${formatNumber(row.frs)}, ERS
                    S${formatNumber(row.ers)}
                  </li>
                ))}
              </ul>
            </>
          )}

          <Typography color="muted" type="body-sm">
            Withdrawal at {retirementAge} depends on the amount set aside,
            property-related conditions and other CPF withdrawal rules. Amounts
            left in CPF continue earning the applicable interest.
          </Typography>
        </Card.Content>
      </Card>
    </section>
  );
}
