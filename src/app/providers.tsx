"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";
import { I18nProvider, RouterProvider } from "react-aria-components";
import { CpfStoreProvider } from "@/providers/cpf-store-provider";

/**
 * Root providers component.
 *
 * Wraps the application with all context providers:
 * - RouterProvider so `href` on any React Aria (HeroUI) component navigates
 *   through the Next.js router rather than doing a full page load
 * - I18nProvider pinning React Aria (HeroUI) formatting to en-SG
 * - ThemeProvider for dark/light mode
 * - CpfStoreProvider for the Zustand store
 */
export function Providers({ children }: PropsWithChildren) {
  const router = useRouter();
  /*
   * `typedRoutes` makes router.push generic over known routes, which does not
   * match React Aria's plain (path: string) signature. React Aria only ever
   * passes an href that came from a component prop, so widening here is safe.
   */
  const navigate = (path: string) => router.push(path as Route);

  return (
    <RouterProvider navigate={navigate}>
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
