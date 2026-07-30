import { Skeleton } from "@heroui/react";
import type { ReactNode } from "react";

export default function At55Loading(): ReactNode {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-10 w-full max-w-2xl rounded" />
        <Skeleton className="h-4 w-full max-w-3xl rounded" />
        <Skeleton className="h-4 w-4/5 max-w-3xl rounded" />
      </div>
      <Skeleton className="h-96 w-full rounded-lg" />
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="h-72 w-full rounded-lg" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    </div>
  );
}
