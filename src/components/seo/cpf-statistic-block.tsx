import { Card, Typography } from "@heroui/react";
import { formatNumber } from "@/lib/format";
import { CPF_POLICY_CATALOGUE, resolveContributionSchedule } from "@/policy";

export default function CpfStatisticBlock() {
  const schedule = resolveContributionSchedule(
    CPF_POLICY_CATALOGUE.metadata["cpf-contribution-rates"].verifiedAt,
  ).schedule;
  const interest = CPF_POLICY_CATALOGUE.interestRateMethodology;
  const stats = [
    {
      label: `Monthly OW ceiling (${schedule.effectiveFrom.slice(0, 4)})`,
      value: `S$${formatNumber(schedule.ordinaryWageCeiling)}`,
      detail: `Official schedule ${schedule.id}`,
    },
    {
      label: "OA interest rate (floor)",
      value: `${interest.ordinaryAccount.floorRate}% p.a.`,
      detail: interest.ordinaryAccount.peg,
    },
    {
      label: "SMRA interest rate (floor)",
      value: `${interest.specialMediSaveRetirementAccounts.floorRate}% p.a.`,
      detail: interest.specialMediSaveRetirementAccounts.peg,
    },
  ];

  return (
    <section aria-labelledby="cpf-statistics" data-content-block="statistics">
      <Card>
        <Card.Header>
          <Card.Title id="cpf-statistics">
            Key CPF Numbers at a Glance
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-surface-secondary p-4"
              >
                <Typography className="mb-2" color="muted" type="body-sm">
                  {stat.label}
                </Typography>
                <Typography type="h3" weight="bold">
                  {stat.value}
                </Typography>
                <Typography color="muted" type="body-xs">
                  {stat.detail}
                </Typography>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    </section>
  );
}
