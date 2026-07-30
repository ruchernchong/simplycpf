import { Card } from "@heroui/react";
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
        <Card.Title className="font-semibold text-base tracking-tight">
          Where each dollar is allocated, by age
        </Card.Title>
        <Card.Description className="text-[12.5px] text-muted">
          OA dark · SA mid · MediSave pale
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <ul className="flex flex-col gap-3">
          {ageGroups.map((group) => {
            const { OA, SA, MA } = group.distributionRate;

            return (
              <li key={group.description} className="flex items-center gap-4">
                <span className="w-[150px] shrink-0 text-[12.5px] text-muted">
                  {group.description}
                </span>
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
                <span className="w-[112px] shrink-0 text-right font-mono text-[11.5px] text-muted">
                  {share(OA)} / {share(SA)} / {share(MA)}
                </span>
              </li>
            );
          })}
        </ul>
      </Card.Content>
      <Card.Footer>
        <p className="text-[12.5px] text-muted leading-relaxed">
          For members aged 55 and above the middle share goes to the Retirement
          Account, since the Special Account no longer receives contributions.
        </p>
      </Card.Footer>
    </Card>
  );
}
