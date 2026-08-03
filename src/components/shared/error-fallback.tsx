"use client";

import { Button, Card } from "@heroui/react";
import { AlertCircleIcon, RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import posthog from "posthog-js";
import { useEffect } from "react";

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  title: string;
  description: string;
  logLabel: string;
  containerClassName?: string;
}

export function ErrorFallback({
  error,
  reset,
  title,
  description,
  logLabel,
  containerClassName = "flex min-h-screen flex-col items-center justify-center px-4 py-8",
}: ErrorFallbackProps) {
  useEffect(() => {
    console.error(`${logLabel}:`, error);
    posthog.captureException(error, { tags: { logLabel } });
  }, [error, logLabel]);

  return (
    <div className={containerClassName}>
      <Card className="w-full max-w-md">
        <Card.Header>
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={AlertCircleIcon}
              className="size-6 text-red-500"
              strokeWidth={2}
            />
            <Card.Title>{title}</Card.Title>
          </div>
          <Card.Description>{description}</Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <p className="text-muted text-sm">
            {error.message || "An unexpected error occurred"}
          </p>
          {error.digest && (
            <p className="text-muted text-xs">Error ID: {error.digest}</p>
          )}
          <Button onPress={reset} className="w-full" variant="primary">
            <HugeiconsIcon
              icon={RefreshIcon}
              className="mr-2 size-4"
              strokeWidth={2}
            />
            Try Again
          </Button>
        </Card.Content>
      </Card>
    </div>
  );
}
