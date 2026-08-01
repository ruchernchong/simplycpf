import { Skeleton } from "@heroui/react";

function CalculatorLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-[28rem] max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
        <Skeleton className="h-[420px] w-full" />
        <div className="flex flex-col gap-5">
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
          <Skeleton className="h-72 w-full" />
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalculatorLoading;
