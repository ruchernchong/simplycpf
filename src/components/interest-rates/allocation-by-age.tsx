import { Card, Typography } from "@heroui/react";
import { SplitBar } from "@/components/shared/split-bar";
import { resolveContributionSchedule } from "@/policy";

function share(rate: number) {
  return (rate * 100).toFixed(1);
}

/** One proportional bar per age band showing the OA / SA / MA split. */
export function AllocationByAge() {
  const schedule = resolveContributionSchedule("2026-08").schedule;

  return (
    <Card>
      <Card.Header>
        <Card.Title>Where each dollar is allocated, by age</Card.Title>
        <Card.Description>OA dark · SA/RA mid · MediSave pale</Card.Description>
      </Card.Header>
      <Card.Content>
        <ul className="flex flex-col gap-4">
          {schedule.allocationRates.map((group) => {
            const OA = group.oaBasisPoints / 10000;
            const retirement = group.retirementBasisPoints / 10000;
            const MA = group.maBasisPoints / 10000;
            const retirementLabel =
              (group.minAgeExclusive ?? 0) >= 55
                ? "RA"
                : group.maxAgeInclusive === 55
                  ? "SA/RA"
                  : "SA";

            return (
              <li key={group.id} className="flex items-center gap-4">
                <Typography
                  className="w-[150px] shrink-0"
                  color="muted"
                  type="body-sm"
                >
                  {group.description}
                </Typography>
                <SplitBar
                  size="sm"
                  className="min-w-0 flex-1"
                  segments={[
                    { label: "OA", value: OA, color: "chart-1" },
                    {
                      label: retirementLabel,
                      value: retirement,
                      color: "chart-2",
                    },
                    { label: "MA", value: MA, color: "chart-3" },
                  ]}
                  formatValue={(value) => `${share(value)}%`}
                />
                <Typography
                  align="end"
                  className="w-[112px] shrink-0"
                  color="muted"
                  type="body-xs"
                >
                  {share(OA)} / {share(retirement)} / {share(MA)}
                </Typography>
              </li>
            );
          })}
        </ul>
      </Card.Content>
      <Card.Footer>
        <Typography color="muted" type="body-sm">
          The middle share goes to SA below age 55 and RA from age 55 after the
          SA closure. For the “above 50 to 55” band, the destination therefore
          depends on the member's exact age.
        </Typography>
      </Card.Footer>
    </Card>
  );
}
