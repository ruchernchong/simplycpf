import { Card, Typography } from "@heroui/react";
import { SplitBar } from "@/components/shared/split-bar";
import { ageGroups } from "@/data";

function share(rate: number) {
  return (rate * 100).toFixed(1);
}

/** One proportional bar per age band showing the OA / SA / MA split. */
export function AllocationByAge() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Where each dollar is allocated, by age</Card.Title>
        <Card.Description>OA dark · SA mid · MediSave pale</Card.Description>
      </Card.Header>
      <Card.Content>
        <ul className="flex flex-col gap-3">
          {ageGroups.map((group) => {
            const { OA, SA, MA } = group.distributionRate;

            return (
              <li key={group.description} className="flex items-center gap-4">
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
                    { label: "SA", value: SA, color: "chart-2" },
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
                  {share(OA)} / {share(SA)} / {share(MA)}
                </Typography>
              </li>
            );
          })}
        </ul>
      </Card.Content>
      <Card.Footer>
        <Typography color="muted" type="body-sm">
          For members aged 55 and above the middle share goes to the Retirement
          Account, since the Special Account no longer receives contributions.
        </Typography>
      </Card.Footer>
    </Card>
  );
}
