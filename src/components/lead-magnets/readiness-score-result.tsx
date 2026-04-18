import type { Route } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReadinessResult } from "@/lib/calculate-retirement-readiness";
import { cn } from "@/lib/utils";

interface ReadinessScoreResultProps {
  result: ReadinessResult;
}

export default function ReadinessScoreResult({
  result,
}: ReadinessScoreResultProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Your readiness score: {result.score}/100</CardTitle>
        <CardDescription>{result.bucketLabel}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="font-medium text-foreground">{result.headline}</p>
        <p className="text-muted-foreground">{result.summary}</p>
        <div className="flex flex-col gap-2">
          <p className="font-medium text-foreground">Suggested next steps</p>
          <ul className="flex flex-col gap-2 text-muted-foreground text-sm">
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
      </CardContent>
    </Card>
  );
}
