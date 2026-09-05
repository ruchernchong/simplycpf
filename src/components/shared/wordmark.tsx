import { cn } from "@heroui/react";
import Link from "next/link";
import type { ReactElement } from "react";

interface WordmarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * SimplyCPF wordmark: the name with an ink rule beneath it, broken by one
 * forest segment. The rule is the line drawn under a figure that has been
 * checked, never render the wordmark without it.
 */
export function Wordmark({
  size = "md",
  className,
}: WordmarkProps): ReactElement {
  const isSmall = size === "sm";
  const isLarge = size === "lg";

  return (
    <Link
      href="/"
      className={cn("flex flex-col items-start", className)}
      style={{ gap: isSmall ? 3 : isLarge ? 6 : 4 }}
    >
      <span
        className="font-semibold tracking-tight"
        style={{
          fontSize: isSmall
            ? 13
            : isLarge
              ? "clamp(1.125rem, 6vw, 1.875rem)"
              : 17.5,
          letterSpacing: "-0.02em",
        }}
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
          style={{ height: isSmall ? 2 : isLarge ? 4 : 2.5 }}
        />
        <span
          className="rounded-full bg-accent"
          style={{
            height: isSmall ? 2 : isLarge ? 4 : 2.5,
            width: isSmall ? 16 : isLarge ? 36 : 22,
          }}
        />
      </span>
    </Link>
  );
}
