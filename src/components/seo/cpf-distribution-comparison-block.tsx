import { Card, Link, Typography } from "@heroui/react";
import { CPF_POLICY_CATALOGUE, resolveContributionSchedule } from "@/policy";

const allocationMetadata =
  CPF_POLICY_CATALOGUE.metadata["cpf-allocation-rates"];
const currentSchedule = resolveContributionSchedule(
  allocationMetadata.verifiedAt,
).schedule;
const retirementAge =
  CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;

function formatBasisPoints(value: number): string {
  return `${(value / 100).toFixed(1)}%`;
}

export default function CpfDistributionComparisonBlock() {
  return (
    <section
      aria-labelledby="cpf-distribution-comparison"
      data-content-block="comparison"
    >
      <Card>
        <Card.Header>
          <Card.Title id="cpf-distribution-comparison">
            CPF Allocation Rates by Age Group
          </Card.Title>
          <Card.Description>
            Share of each CPF contribution, not the employee and employer
            contribution rate
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pr-4 pb-4 text-left font-semibold">
                    Age Group
                  </th>
                  <th className="pr-4 pb-4 text-right font-semibold">
                    OA (Ordinary)
                  </th>
                  <th className="pr-4 pb-4 text-right font-semibold">
                    SA / RA (Retirement)
                  </th>
                  <th className="pb-4 text-right font-semibold">
                    MA (MediSave)
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentSchedule.allocationRates.map((group) => (
                  <tr key={group.id} className="border-b last:border-0">
                    <td className="py-4 pr-4 font-medium">
                      {group.description}
                    </td>
                    <td className="py-4 pr-4 text-right font-mono">
                      {formatBasisPoints(group.oaBasisPoints)}
                    </td>
                    <td className="py-4 pr-4 text-right font-mono">
                      {formatBasisPoints(group.retirementBasisPoints)}
                    </td>
                    <td className="py-4 text-right font-mono">
                      {formatBasisPoints(group.maBasisPoints)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Content>
        <Card.Footer className="flex flex-col items-start gap-2">
          <Typography color="muted" type="body-sm">
            The retirement share goes to SA below age {retirementAge}. From age{" "}
            {retirementAge} after the SA closure, it goes to RA until the FRS is
            met, then OA. The age band that crosses this threshold is therefore
            destination-dependent.
          </Typography>
          <Typography color="muted" type="body-xs">
            Schedule {currentSchedule.effectiveFrom} to{" "}
            {currentSchedule.effectiveTo}; allocation dataset verified{" "}
            {allocationMetadata.verifiedAt}.
          </Typography>
          <Link
            href={allocationMetadata.sources[0]?.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            CPF Board allocation rates
            <Link.Icon aria-hidden="true" />
          </Link>
        </Card.Footer>
      </Card>
    </section>
  );
}
