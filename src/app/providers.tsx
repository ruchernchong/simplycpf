"use client";

import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";
import { CpfStoreProvider } from "@/providers/cpf-store-provider";

/**
 * Root providers component.
 *
 * Wraps the application with all context providers:
 * - ThemeProvider for dark/light mode
 * - CpfStoreProvider for the Zustand store
 */
export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <CpfStoreProvider>{children}</CpfStoreProvider>
    </ThemeProvider>
  );
};
