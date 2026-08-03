"use client";

import { ErrorFallback } from "@/components/shared/error-fallback";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Application Error"
      description="Something went wrong with the application"
      logLabel="Application error"
    />
  );
}
