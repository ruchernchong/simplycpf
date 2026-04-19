"use client";

import { shallow } from "zustand/shallow";
import { ageGroups } from "@/data";
import { useCpfStore } from "@/hooks/use-cpf-store";
import { formatPercentage } from "@/lib/format";
import { cn } from "@/lib/utils";
import { selectAgeGroup } from "@/stores/selectors";
import type { AgeGroup } from "@/types";

const ACCOUNT_KEYS = ["OA", "SA", "MA"] as const;

const formatDistributionRate = (value: number): string =>
  formatPercentage(value, { decimalPlaces: 1 });

interface DistributionRowProps {
  group: AgeGroup;
  isCurrentGroup: boolean;
}

const DesktopRow = ({ group, isCurrentGroup }: DistributionRowProps) => (
  <div
    className={cn(
      "grid grid-cols-4 gap-4 border-border border-b py-3 text-[13px] last:border-b-0",
      isCurrentGroup && "bg-accent/10",
    )}
  >
    <p className="font-medium text-foreground">{group.description}</p>
    {ACCOUNT_KEYS.map((key) => (
      <p key={key} className="text-right font-mono text-muted-foreground">
        {formatDistributionRate(group.distributionRate[key])}
      </p>
    ))}
  </div>
);

const MobileRow = ({ group, isCurrentGroup }: DistributionRowProps) => (
  <div
    className={cn(
      "flex flex-col gap-2 border-border border-b py-3 last:border-b-0",
      isCurrentGroup && "bg-accent/10",
    )}
  >
    <p className="font-semibold text-[14px] text-foreground">
      {group.description}
    </p>
    <div className="grid grid-cols-3 gap-3 text-[12px]">
      {ACCOUNT_KEYS.map((key) => (
        <div key={key}>
          <p className="text-muted-foreground">{key}</p>
          <p className="font-medium font-mono">
            {formatDistributionRate(group.distributionRate[key])}
          </p>
        </div>
      ))}
    </div>
  </div>
);

export const DistributionRatesTable = () => {
  const currentAgeGroup = useCpfStore(selectAgeGroup, shallow);

  const isCurrentAgeGroup = (group: AgeGroup): boolean =>
    group.description === currentAgeGroup?.description;

  return (
    <div>
      <div className="hidden md:block">
        <div className="grid grid-cols-4 gap-4 border-border border-b py-2 font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.08em]">
          <p>Age Group</p>
          {ACCOUNT_KEYS.map((key) => (
            <p key={key} className="text-right">
              {key} %
            </p>
          ))}
        </div>
        {ageGroups.map((group) => (
          <DesktopRow
            key={group.description}
            group={group}
            isCurrentGroup={isCurrentAgeGroup(group)}
          />
        ))}
      </div>

      <div className="flex flex-col md:hidden">
        {ageGroups.map((group) => (
          <MobileRow
            key={group.description}
            group={group}
            isCurrentGroup={isCurrentAgeGroup(group)}
          />
        ))}
      </div>
    </div>
  );
};

export default DistributionRatesTable;
