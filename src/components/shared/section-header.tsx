import { cn, Typography } from "@heroui/react";
import type { ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
  withDot?: boolean;
  className?: string;
}

/**
 * Mono uppercase eyebrow label, the "machine produced" register. Optionally
 * led by the live-data forest dot.
 */
export function Eyebrow({ children, withDot, className }: EyebrowProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {withDot && (
        <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      )}
      <Typography
        className="text-accent uppercase"
        type="body-xs"
        weight="semibold"
      >
        {children}
      </Typography>
    </div>
  );
}

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  lede?: string;
  actions?: ReactNode;
}

/** Screen heading: muted mono eyebrow, display title, optional lede + actions. */
export function PageHeader({ eyebrow, title, lede, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-2">
      <Typography color="muted" type="body-xs" weight="semibold">
        {eyebrow}
      </Typography>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Typography className="text-balance" type="h1">
          {title}
        </Typography>
        {actions}
      </div>
      {lede && (
        <Typography className="max-w-[76ch] text-pretty" color="muted">
          {lede}
        </Typography>
      )}
    </header>
  );
}
