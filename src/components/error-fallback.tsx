"use client";

import { AlertCircleIcon, RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import posthog from "posthog-js";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
        <CardHeader>
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={AlertCircleIcon}
              className="size-6 text-red-500"
              strokeWidth={2}
            />
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            {error.message || "An unexpected error occurred"}
          </p>
          {error.digest && (
            <p className="text-muted-foreground text-xs">
              Error ID: {error.digest}
            </p>
          )}
          <Button onClick={reset} className="w-full" variant="default">
            <HugeiconsIcon
              icon={RefreshIcon}
              className="mr-2 size-4"
              strokeWidth={2}
            />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
