import { Skeleton } from "@heroui/react";
import type { ReactNode } from "react";

export default function CpfCheckLoading(): ReactNode {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-full max-w-2xl" />
        <Skeleton className="h-4 w-full max-w-3xl" />
        <Skeleton className="h-4 w-4/5 max-w-3xl" />
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              className="h-28 w-full"
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder list
              key={index}
            />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}
