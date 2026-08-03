import { cn } from "@heroui/react";
import type { ReactElement, ReactNode } from "react";

type EyebrowColor = "accent" | "muted";

interface EyebrowProps {
  children: ReactNode;
  color?: EyebrowColor;
  withDot?: boolean;
  className?: string;
}

/**
 * Mono uppercase eyebrow label, the "machine produced" register. Optionally
 * led by the live-data forest dot.
 */
export function Eyebrow({
  children,
  color = "accent",
  withDot,
  className,
}: EyebrowProps): ReactElement {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      {withDot && (
        <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      )}
      <span
        className={cn(
          "font-mono text-[10.5px] uppercase tracking-[0.13em]",
          color === "muted" ? "text-muted" : "text-accent",
        )}
      >
        {children}
      </span>
    </span>
  );
}
