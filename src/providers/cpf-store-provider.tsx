"use client";

import { type ReactNode, useContext, useState } from "react";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { type CpfStore, createCpfStore } from "@/stores/cpf-store";
import { CpfStoreContext } from "@/stores/cpf-store-context";

export type CpfStoreApi = ReturnType<typeof createCpfStore>;

export interface CpfStoreProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps children with the CPF Zustand store.
 *
 * This follows the Zustand docs pattern for React context integration:
 * - Store is created once using useState lazy initialization
 * - Context provides the store to all children
 * - useStore hook from zustand/react reads from this context
 */
export const CpfStoreProvider = ({ children }: CpfStoreProviderProps) => {
  // Use useState with lazy initialization to ensure store is created only once
  // even during React Strict Mode double-renders
  const [store] = useState(() => createCpfStore());

  return (
    <CpfStoreContext.Provider value={store}>
      {children}
    </CpfStoreContext.Provider>
  );
};

/**
 * Custom hook to access the CPF Zustand store.
 *
 * Must be used within a CpfStoreProvider.
 *
 * @example
 * ```tsx
 * const income = useCpfStore((state) => state.settings.monthlyGrossIncome);
 * const setIncome = useCpfStore((state) => state.setIncome);
 * ```
 *
 * @param selector - Function that selects a slice of the store state
 * @param equalityFn - Optional equality function for shallow comparison (use with objects/arrays)
 * @returns The selected state slice
 * @throws Error if used outside of CpfStoreProvider
 */
export const useCpfStore = <T,>(
  selector: (store: CpfStore) => T,
  equalityFn?: (a: T, b: T) => boolean,
): T => {
  const store = useContext(CpfStoreContext);
  if (!store) {
    throw new Error("useCpfStore must be used within CpfStoreProvider");
  }

  return useStoreWithEqualityFn(store, selector, equalityFn);
};
