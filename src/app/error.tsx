"use client";

import { ErrorFallback } from "@/components/shared/error-fallback";

interface ErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function RootError({ error, retry }: ErrorProps) {
  return (
    <ErrorFallback
      error={error}
      retry={retry}
      title="Application Error"
      description="Something went wrong with the application"
      logLabel="Application error"
    />
  );
}
