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

interface CheatSheetCtaProps {
  compact?: boolean;
}

export default function CheatSheetCta({ compact = false }: CheatSheetCtaProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>CPF Cheat Sheet</CardTitle>
        <CardDescription>
          Keep the core CPF rates, ceilings, PR transitions, retirement sums,
          and top-up limits in one printable PDF.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          Useful if you want the reference numbers close by while using the
          calculator, projection page, or CPF LIFE estimator.
        </p>
        <Link
          href="/cpf-cheat-sheet"
          className={cn(
            buttonVariants({ variant: compact ? "outline" : "default" }),
            "w-full justify-center",
          )}
        >
          Open the cheat sheet
        </Link>
      </CardContent>
    </Card>
  );
}
