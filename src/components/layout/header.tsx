"use client";

import { Segment } from "@heroui-pro/react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/layout/theme-toggle";
import { Wordmark } from "@/components/shared/wordmark";
import { useCpfStore } from "@/hooks/use-cpf-store";
import { formatCurrency } from "@/lib/format";
import {
  selectAge,
  selectFormStep,
  selectMonthlyGrossIncome,
} from "@/stores/selectors";

interface NavItem {
  href: Route;
  label: string;
}

const questionNavItems: NavItem[] = [
  { href: "/" as Route, label: "Home" },
  { href: "/calculator" as Route, label: "This month" },
  { href: "/cpf-at-55" as Route, label: "At 55" },
  { href: "/accrued-interest" as Route, label: "Home & OA" },
  { href: "/cpf-life" as Route, label: "CPF LIFE" },
  { href: "/what-if" as Route, label: "Compare" },
];

const referenceNavItems: NavItem[] = [
  { href: "/interest-rates" as Route, label: "Rates" },
  { href: "/cpf-cheat-sheet" as Route, label: "Cheat sheet" },
  { href: "/cpf-check" as Route, label: "Check" },
];

function NavSegment({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const selectedKey =
    items.find((item) => item.href === pathname)?.href ?? null;

  return (
    <Segment
      size="sm"
      selectedKey={selectedKey}
      onSelectionChange={(key) => {
        if (key) router.push(key as Route);
      }}
    >
      {items.map((item) => (
        <Segment.Item key={item.href} id={item.href}>
          {item.label}
        </Segment.Item>
      ))}
    </Segment>
  );
}

function InputSummary() {
  const age = useCpfStore(selectAge);
  const income = useCpfStore(selectMonthlyGrossIncome);
  const formStep = useCpfStore(selectFormStep);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || formStep < 2) return null;

  return (
    <span className="hidden text-muted text-xs xl:block">
      Age {age} · {formatCurrency(income, 0)}/mo
    </span>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-border border-b bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
      >
        Skip to content
      </a>
      <div className="container mx-auto flex h-18 items-center justify-between gap-4 px-4">
        <Wordmark />

        <nav aria-label="Main" className="hidden items-center gap-2 lg:flex">
          <NavSegment items={questionNavItems} />
          <span aria-hidden className="h-5 w-px bg-foreground/15" />
          <NavSegment items={referenceNavItems} />
        </nav>

        <div className="flex items-center gap-4">
          <InputSummary />
          <ThemeToggle />
        </div>
      </div>

      <nav
        aria-label="Main, compact"
        className="flex gap-4 overflow-x-auto px-4 pb-2 lg:hidden"
      >
        {[...questionNavItems, ...referenceNavItems].map((item) => (
          <MobileNavLink key={item.href} item={item} />
        ))}
      </nav>
    </header>
  );
}

function MobileNavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={
        isActive
          ? "whitespace-nowrap font-medium text-foreground text-sm"
          : "whitespace-nowrap text-muted text-sm"
      }
    >
      {item.label}
    </Link>
  );
}
