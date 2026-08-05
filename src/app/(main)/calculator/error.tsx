"use client";

import { ErrorFallback } from "@/components/shared/error-fallback";

interface ErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function CalculatorError({ error, retry }: ErrorProps) {
  return (
    <ErrorFallback
      error={error}
      retry={retry}
      title="Calculation Error"
      description="Something went wrong with your calculation"
      logLabel="Calculator error"
      containerClassName="flex min-h-screen flex-col items-center justify-center px-4"
    />
  );
}
