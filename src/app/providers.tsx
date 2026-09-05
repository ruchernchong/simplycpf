"use client";

import { ThemeProvider } from "@teispace/next-themes";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";
import { I18nProvider, RouterProvider } from "react-aria-components";
import { CpfStoreProvider } from "@/providers/cpf-store-provider";

declare module "react-aria-components" {
  interface RouterConfig {
    href: Route;
  }
}

/**
 * Root providers component.
 *
 * Wraps the application with all context providers:
 * - RouterProvider preserving shared state during HeroUI navigation
 * - I18nProvider pinning React Aria (HeroUI) formatting to en-SG
 * - ThemeProvider for dark/light mode
 * - CpfStoreProvider for the Zustand store
 */
export function Providers({ children }: PropsWithChildren) {
  const router = useRouter();
  return (
    <RouterProvider navigate={router.push}>
      <I18nProvider locale="en-SG">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CpfStoreProvider>{children}</CpfStoreProvider>
        </ThemeProvider>
      </I18nProvider>
    </RouterProvider>
  );
}
