"use client";

import { useCpfStore as useCpfStoreFromProvider } from "@/providers/cpf-store-provider";

/**
 * Re-export from providers for consistency.
 *
 * The useCpfStore hook is defined alongside CpfStoreProvider
 * in the providers file as per Zustand docs pattern.
 */
export type { CpfStoreProviderProps } from "@/providers/cpf-store-provider";

export const useCpfStore = useCpfStoreFromProvider;

/**
 * Convenience hook that returns the entire store state and actions.
 * Useful when you need multiple values from the store.
 *
 * @example
 * ```tsx
 * const { settings, updateSettings } = useCpfStoreState();
 * ```
 *
 * @returns The full CPF store state and actions
 * @throws Error if used outside of CpfStoreProvider
 */
export const useCpfStoreState = () => {
  return useCpfStoreFromProvider((state) => state);
};
