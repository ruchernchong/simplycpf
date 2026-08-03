"use client";

import { ErrorFallback } from "@/components/shared/error-fallback";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CalculatorError({ error, reset }: ErrorProps) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Calculation Error"
      description="Something went wrong with your calculation"
      logLabel="Calculator error"
      containerClassName="flex min-h-screen flex-col items-center justify-center px-4"
    />
  );
}
