import type { SVGProps } from "react";

interface LogoProps extends SVGProps<SVGSVGElement> {
  variant?: "full" | "mark";
}

/**
 * SimplyCPF Logo
 * Three ascending bars represent OA, SA, MA accounts
 * The enclosing shape forms a stylised "C"
 */
export function Logo({
  variant = "mark",
  className,
  ...props
}: LogoProps): React.ReactNode {
  if (variant === "mark") {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="SimplyCPF logo"
        {...props}
      >
        <title>SimplyCPF logo</title>
        {/* Background circle */}
        <rect width="32" height="32" rx="8" className="fill-primary" />

        {/* Three ascending bars - OA, SA, MA */}
        <rect
          x="7"
          y="18"
          width="5"
          height="8"
          rx="1.5"
          className="fill-primary-foreground"
        />
        <rect
          x="13.5"
          y="13"
          width="5"
          height="13"
          rx="1.5"
          className="fill-accent"
        />
        <rect
          x="20"
          y="8"
          width="5"
          height="18"
          rx="1.5"
          className="fill-primary-foreground"
        />

        {/* Subtle arc suggesting growth trajectory */}
        <path
          d="M6 22 Q16 4, 26 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          className="stroke-accent opacity-60"
        />
      </svg>
    );
  }

  // Full variant with text
  return (
    <svg
      viewBox="0 0 180 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="SimplyCPF logo"
      {...props}
    >
      <title>SimplyCPF logo</title>
      {/* Logo mark */}
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <rect
        x="7"
        y="18"
        width="5"
        height="8"
        rx="1.5"
        className="fill-primary-foreground"
      />
      <rect
        x="13.5"
        y="13"
        width="5"
        height="13"
        rx="1.5"
        className="fill-accent"
      />
      <rect
        x="20"
        y="8"
        width="5"
        height="18"
        rx="1.5"
        className="fill-primary-foreground"
      />
      <path
        d="M6 22 Q16 4, 26 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        className="stroke-accent opacity-60"
      />

      {/* Text: SimplyCPF */}
      <text
        x="42"
        y="21"
        className="fill-foreground"
        style={{
          fontSize: "14px",
          fontWeight: 600,
          fontFamily: "var(--font-sans)",
        }}
      >
        SimplyCPF
      </text>
    </svg>
  );
}
