import { buttonVariants, Card } from "@heroui/react";
import type { Route } from "next";
import Link from "next/link";
import type { ReadinessResult } from "@/lib/calculate-retirement-readiness";
import { cn } from "@/lib/utils";

interface ReadinessScoreResultProps {
  result: ReadinessResult;
}

export default function ReadinessScoreResult({
  result,
}: ReadinessScoreResultProps) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Your readiness score: {result.score}/100</Card.Title>
        <Card.Description>{result.bucketLabel}</Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p className="font-medium text-foreground">{result.headline}</p>
        <p className="text-muted">{result.summary}</p>
        <div className="flex flex-col gap-2">
          <p className="font-medium text-foreground">Suggested next steps</p>
          <ul className="flex flex-col gap-2 text-muted text-sm">
            {result.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
        <Link
          href={result.primaryActionHref as Route}
          className={cn(buttonVariants(), "w-full justify-center")}
        >
          {result.primaryActionLabel}
        </Link>
      </Card.Content>
    </Card>
  );
}
