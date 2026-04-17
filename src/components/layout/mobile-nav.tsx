"use client";

import {
  CodeIcon,
  Home01Icon,
  InformationCircleIcon,
  Moon01Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems: { href: Route; label: string; icon: typeof Home01Icon }[] = [
  { href: "/" as Route, label: "Home", icon: Home01Icon },
  { href: "/about" as Route, label: "About", icon: InformationCircleIcon },
  { href: "/docs" as Route, label: "Developer", icon: CodeIcon },
];

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            aria-label="Open menu"
          />
        }
      >
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M4 6h16M4 12h16M4 18h16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="sr-only">Menu</span>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-muted-foreground text-sm transition-all hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon
                icon={item.icon}
                className="size-5"
                strokeWidth={2}
              />
              {item.label}
            </Link>
          ))}
          <div className="my-2 border-border border-t" />
          <div className="flex items-center justify-between rounded-lg px-4 py-3">
            <span className="font-medium text-muted-foreground text-sm">
              Theme
            </span>
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <HugeiconsIcon
                icon={theme === "dark" ? Sun01Icon : Moon01Icon}
                className="size-5"
                strokeWidth={2}
              />
            </button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
