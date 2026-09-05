"use client";

import { Button, cn, Link } from "@heroui/react";
import { Sheet } from "@heroui-pro/react";
import { Menu } from "lucide-react";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { type ReactElement, useState } from "react";
import ThemeToggle from "@/components/layout/theme-toggle";
import { Wordmark } from "@/components/shared/wordmark";

interface NavItem {
  href: Route;
  label: string;
}

const mainNavItems: NavItem[] = [
  { href: "/calculator", label: "Your pay" },
  { href: "/accrued-interest", label: "Your home" },
  { href: "/projection", label: "Your retirement" },
  { href: "/faq", label: "Learn" },
];

const moreNavItems: NavItem[] = [
  { href: "/cpf-at-55", label: "What happens at 55" },
  { href: "/cpf-life", label: "CPF LIFE" },
  { href: "/what-if", label: "Compare scenarios" },
  { href: "/interest-rates", label: "Interest rates" },
  { href: "/cpf-cheat-sheet", label: "CPF cheat sheet" },
  { href: "/cpf-check", label: "CPF check" },
];

const allNavItems = [...mainNavItems, ...moreNavItems];

function MainNav(): ReactElement {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
      {mainNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={pathname === item.href ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function MobileNav(): ReactElement {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet isOpen={isOpen} onOpenChange={setIsOpen} placement="right">
        <Sheet.Trigger>
          <Button
            aria-label="Open menu"
            isIconOnly
            size="sm"
            variant="secondary"
          >
            <Menu aria-hidden className="size-4" />
          </Button>
        </Sheet.Trigger>
        <Sheet.Backdrop>
          <Sheet.Content className="w-full max-w-xs">
            <Sheet.Dialog>
              <Sheet.Header className="flex items-center justify-between gap-4">
                <Sheet.Heading>Menu</Sheet.Heading>
                <Sheet.CloseTrigger />
              </Sheet.Header>
              <Sheet.Body>
                <nav aria-label="Main, compact" className="flex flex-col gap-2">
                  {allNavItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "rounded-lg px-4 py-2 text-sm no-underline",
                          isActive
                            ? "bg-accent/10 font-medium text-accent"
                            : "text-muted",
                        )}
                        href={item.href}
                        key={item.href}
                        onPress={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </Sheet.Body>
            </Sheet.Dialog>
          </Sheet.Content>
        </Sheet.Backdrop>
      </Sheet>
    </div>
  );
}

export function Header(): ReactElement {
  return (
    <header className="site-header sticky top-0 z-50 w-full border-border border-b bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
      >
        Skip to content
      </a>
      <div className="site-container mx-auto flex h-20 items-center justify-between gap-4 md:h-24">
        <Wordmark size="lg" />

        <MainNav />

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
