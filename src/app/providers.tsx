"use client";

import { ThemeProvider } from "@teispace/next-themes";
import type { PropsWithChildren } from "react";
import { I18nProvider } from "react-aria-components";
import { CpfStoreProvider } from "@/providers/cpf-store-provider";

/**
 * Root providers component.
 *
 * Wraps the application with all context providers:
 * - I18nProvider pinning React Aria (HeroUI) formatting to en-SG
 * - ThemeProvider for dark/light mode
 * - CpfStoreProvider for the Zustand store
 */
export function Providers({ children }: PropsWithChildren) {
  return (
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
  );
}
