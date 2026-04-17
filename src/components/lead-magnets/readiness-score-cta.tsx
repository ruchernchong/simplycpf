import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ReadinessScoreCtaProps {
  compact?: boolean;
}

export default function ReadinessScoreCta({
  compact = false,
}: ReadinessScoreCtaProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Retirement Readiness Score</CardTitle>
        <CardDescription>
          Answer 5 quick questions to see where your CPF planning is clear,
          thin, or missing.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          Useful if you want a faster starting point before opening the
          projection calculator or CPF LIFE estimator.
        </p>
        <Link
          href="/retirement-readiness"
          className={cn(
            buttonVariants({ variant: compact ? "outline" : "default" }),
            "w-full justify-center",
          )}
        >
          Check my readiness
        </Link>
      </CardContent>
    </Card>
  );
}
