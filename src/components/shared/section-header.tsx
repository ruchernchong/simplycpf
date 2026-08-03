import { cn } from "@heroui/react";
import type { ReactElement, ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
  withDot?: boolean;
  className?: string;
}

/**
 * Mono uppercase eyebrow label, the "machine produced" register. Optionally
 * led by the live-data forest dot.
 */
export function Eyebrow({
  children,
  withDot,
  className,
}: EyebrowProps): ReactElement {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      {withDot && (
        <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      )}
      <span className="font-mono text-[10.5px] text-accent uppercase tracking-[0.13em]">
        {children}
      </span>
    </span>
  );
}
