import {
  CodeIcon,
  Home01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import Link from "next/link";
import MobileNav from "@/components/layout/mobile-nav";
import ThemeToggle from "@/components/layout/theme-toggle";
import { Logo } from "@/components/logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-border/50 border-b bg-background/80 backdrop-blur-lg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-4">
              <Logo className="size-9 shadow-sm" />
              <span className="font-semibold text-foreground text-xl tracking-tight transition-colors group-hover:text-primary">
                SimplyCPF
              </span>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-muted-foreground text-sm transition-all hover:bg-muted hover:text-foreground"
              >
                <HugeiconsIcon
                  icon={Home01Icon}
                  className="size-4"
                  strokeWidth={2}
                />
                Home
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-muted-foreground text-sm transition-all hover:bg-muted hover:text-foreground"
              >
                <HugeiconsIcon
                  icon={InformationCircleIcon}
                  className="size-4"
                  strokeWidth={2}
                />
                About
              </Link>
              <Link
                href={"/docs" as Route}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-muted-foreground text-sm transition-all hover:bg-muted hover:text-foreground"
              >
                <HugeiconsIcon
                  icon={CodeIcon}
                  className="size-4"
                  strokeWidth={2}
                />
                Developer
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
