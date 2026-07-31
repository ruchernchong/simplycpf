import { cn } from "@heroui/react";
import Link from "next/link";

interface WordmarkProps {
  size?: "sm" | "md";
  className?: string;
}

/**
 * SimplyCPF wordmark: the name with an ink rule beneath it, broken by one
 * forest segment. The rule is the line drawn under a figure that has been
 * checked, never render the wordmark without it.
 */
export function Wordmark({ size = "md", className }: WordmarkProps) {
  const isSmall = size === "sm";

  return (
    <Link
      href="/"
      className={cn("flex flex-col items-start", className)}
      style={{ gap: isSmall ? 3 : 4 }}
    >
      <span
        className="font-semibold tracking-tight"
        style={{ fontSize: isSmall ? 13 : 17.5, letterSpacing: "-0.02em" }}
      >
        SimplyCPF
      </span>
      <span
        aria-hidden
        className="flex w-full"
        style={{ gap: isSmall ? 2.5 : 3 }}
      >
        <span
          className="flex-1 rounded-full bg-foreground"
          style={{ height: isSmall ? 2 : 2.5 }}
        />
        <span
          className="rounded-full bg-accent"
          style={{ height: isSmall ? 2 : 2.5, width: isSmall ? 16 : 22 }}
        />
      </span>
    </Link>
  );
}
