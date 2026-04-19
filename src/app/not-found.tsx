import { Calculator01Icon, Home01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NotFound = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-12 text-center">
    <p className="font-bold text-[64px] text-foreground tracking-tight md:text-[72px]">
      404
    </p>
    <h1 className="font-semibold text-[20px] text-foreground">
      Page not found
    </h1>
    <p className="max-w-md text-[13px] text-muted-foreground">
      The page you&apos;re looking for doesn&apos;t exist or has been moved. Try
      the calculator, or head back home.
    </p>
    <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
      <Link href="/" className={cn(buttonVariants({ size: "sm" }), "gap-2")}>
        <HugeiconsIcon
          icon={Home01Icon}
          className="size-4"
          strokeWidth={2}
          aria-hidden="true"
        />
        Back to home
      </Link>
      <Link
        href="/calculator"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "gap-2",
        )}
      >
        <HugeiconsIcon
          icon={Calculator01Icon}
          className="size-4"
          strokeWidth={2}
          aria-hidden="true"
        />
        Open calculator
      </Link>
    </div>
  </div>
);

export default NotFound;
