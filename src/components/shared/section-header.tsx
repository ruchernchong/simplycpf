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

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  lede?: string;
  actions?: ReactNode;
}

/** Screen heading: muted mono eyebrow, display title, optional lede + actions. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  actions,
}: PageHeaderProps): ReactElement {
  return (
    <header className="flex flex-col gap-2">
      <span className="font-mono text-[10.5px] text-muted uppercase tracking-[0.13em]">
        {eyebrow}
      </span>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-balance font-semibold text-4xl tracking-tight">
          {title}
        </h1>
        {actions}
      </div>
      {lede && (
        <p className="max-w-[76ch] text-pretty text-base text-muted leading-relaxed">
          {lede}
        </p>
      )}
    </header>
  );
}
