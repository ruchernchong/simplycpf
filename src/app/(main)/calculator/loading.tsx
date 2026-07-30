import { Skeleton } from "@heroui/react";

function CalculatorLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-10 w-[28rem] max-w-full rounded" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
        <Skeleton className="h-[420px] w-full rounded-lg" />
        <div className="flex flex-col gap-5">
          <Skeleton className="h-32 w-full rounded-lg" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
          <Skeleton className="h-72 w-full rounded-lg" />
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalculatorLoading;
