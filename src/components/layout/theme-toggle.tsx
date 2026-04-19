"use client";

import {
  ComputerIcon,
  Moon01Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";

const themeOptions = [
  {
    value: "light",
    label: "Light",
    icon: Sun01Icon,
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon01Icon,
  },
  {
    value: "system",
    label: "System",
    icon: ComputerIcon,
  },
] as const;

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const name = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-[92px]" />;
  }

  const activeIndex = Math.max(
    themeOptions.findIndex((option) => option.value === theme),
    0,
  );

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="relative inline-flex h-9 items-center rounded-full bg-muted p-1 shadow-[inset_0_1px_2px_oklch(0_0_0/0.04)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-1 bottom-1 left-1 w-7 rounded-full bg-card shadow-sm ring-1 ring-border/60 transition-transform duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
        style={{ transform: `translateX(calc(${activeIndex} * 100%))` }}
      />
      {themeOptions.map(({ value, label, icon }) => (
        <label
          key={value}
          className="relative z-10 grid size-7 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors duration-200 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background hover:text-foreground has-[:checked]:text-foreground"
        >
          <input
            type="radio"
            name={name}
            value={value}
            checked={value === theme}
            onChange={() => setTheme(value)}
            className="sr-only"
            aria-label={label}
          />
          <HugeiconsIcon icon={icon} className="size-4" strokeWidth={2} />
        </label>
      ))}
    </div>
  );
};

export default ThemeToggle;
