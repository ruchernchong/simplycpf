import { cn } from "@heroui/react";
import type { ReactElement } from "react";

export type SplitBarColor =
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "track";

export interface SplitBarSegment {
  label: string;
  value: number;
  color: SplitBarColor;
}

interface SplitBarProps {
  segments: SplitBarSegment[];
  /** sm: 20px silent bar · md: 36px labelled · lg: 38px labelled hero bar */
  size?: "sm" | "md" | "lg";
  formatValue?: (value: number) => string;
  className?: string;
  /** Include formatted values in visible labels when the segment is wide enough. */
  showValues?: boolean;
}

const HEIGHTS: Record<NonNullable<SplitBarProps["size"]>, number> = {
  sm: 20,
  md: 36,
  lg: 38,
};

const FILL_CLASSES: Record<SplitBarColor, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
  track: "bg-foreground/10",
};

/** Light fills carry ink text; dark fills carry paper text. */
const TEXT_CLASSES: Record<SplitBarColor, string> = {
  "chart-1": "text-background",
  "chart-2": "text-(--eclipse)",
  "chart-3": "text-foreground",
  "chart-4": "text-background",
  "chart-5": "text-background",
  track: "text-foreground",
};

/**
 * A proportional multi-segment bar with labels inside the segments.
 * HeroUI has no segmented bar (Meter/ProgressBar are single-fill), so this
 * renders the brand's fixed chart encoding directly from the chart tokens.
 */
export function SplitBar({
  segments,
  size = "md",
  formatValue,
  className,
  showValues = false,
}: SplitBarProps): ReactElement | null {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  if (total <= 0) return null;

  const description = segments
    .map(
      (segment) =>
        `${segment.label} ${
          formatValue
            ? formatValue(segment.value)
            : `${Math.round((segment.value / total) * 100)}%`
        }`,
    )
    .join(", ");
  const showLabels = size !== "sm";

  return (
    <div
      role="img"
      aria-label={description}
      className={cn(
        "flex w-full overflow-hidden",
        size === "sm" ? "rounded-[5px]" : "rounded-lg",
        className,
      )}
      style={{ height: HEIGHTS[size] }}
    >
      {segments.map((segment) => (
        <div
          key={segment.label}
          className={cn(
            "flex min-w-0 items-center overflow-hidden",
            FILL_CLASSES[segment.color],
          )}
          style={{ width: `${(segment.value / total) * 100}%` }}
        >
          {showLabels && (!showValues || segment.value / total >= 0.15) && (
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap pl-2 font-medium text-[12.5px]",
                TEXT_CLASSES[segment.color],
              )}
            >
              {segment.label}
              {showValues && formatValue
                ? ` ${formatValue(segment.value)}`
                : ""}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
