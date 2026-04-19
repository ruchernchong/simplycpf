"use client";

import { createContext } from "react";
import type { StoreApi } from "zustand";
import type { CpfStore } from "./cpf-store";

/**
 * Context for the CPF Zustand store.
 *
 * Uses the context pattern recommended by Zustand docs for Next.js
 * SSR compatibility. The store is created once per component tree
 * and shared across all children.
 *
 * This is defined in a separate file to avoid circular dependencies
 * between the store, providers, and hooks.
 */
export const CpfStoreContext = createContext<StoreApi<CpfStore> | null>(null);
