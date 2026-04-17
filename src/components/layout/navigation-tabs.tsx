"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const navigationItems = [
  { href: "/", label: "Income Ceiling" },
  { href: "/calculator", label: "Calculator" },
  { href: "/projection", label: "Projection" },
  { href: "/interest-rates", label: "Interest Rates" },
  { href: "/investments", label: "Investments" },
];

export function NavigationTabs() {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto">
      <Tabs value={pathname}>
        <TabsList>
          {navigationItems.map((item) => (
            <TabsTrigger
              key={item.href}
              value={item.href}
              nativeButton={false}
              render={<Link href={item.href as Route} />}
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
