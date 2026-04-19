import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { findLatestIncomeCeilingDate } from "@/lib/find-latest-income-ceiling-date";
import type { Settings } from "@/types";

/**
 * Initial/default values matching the current Jotai atom
 */
const initialSettings: Settings = {
  shouldStoreInput: false,
  monthlyGrossIncome: 0,
  birthDate: "",
  citizenshipStatus: "citizen",
};

/**
 * CPF Store State interface
 */
export interface CpfState {
  settings: Settings;
  latestIncomeCeilingDate: string;
}

/**
 * CPF Store Actions interface
 */
export interface CpfActions {
  updateSettings: (settings: Partial<Settings>) => void;
  setIncome: (monthlyGrossIncome: number) => void;
  setBirthDate: (birthDate: string) => void;
  setCitizenshipStatus: (
    citizenshipStatus: Settings["citizenshipStatus"],
  ) => void;
  setShouldStoreInput: (shouldStoreInput: boolean) => void;
  setLatestIncomeCeilingDate: (date: string) => void;
}

/**
 * Full CPF Store type combining state and actions
 */
export type CpfStore = CpfState & CpfActions;

/**
 * Create the CPF Zustand store with persist middleware.
 *
 * Uses createStore from zustand/vanilla for Next.js compatibility.
 * The persist middleware conditionally persists based on shouldStoreInput,
 * matching the current Jotai behavior.
 */
export const createCpfStore = () => {
  return createStore<CpfStore>()(
    persist(
      (set) => ({
        // Initial state
        settings: initialSettings,
        latestIncomeCeilingDate: findLatestIncomeCeilingDate(),

        // Actions
        updateSettings: (partialSettings) =>
          set((state) => ({
            settings: { ...state.settings, ...partialSettings },
          })),

        setIncome: (monthlyGrossIncome) =>
          set((state) => ({
            settings: { ...state.settings, monthlyGrossIncome },
          })),

        setBirthDate: (birthDate) =>
          set((state) => ({
            settings: { ...state.settings, birthDate },
          })),

        setCitizenshipStatus: (citizenshipStatus) =>
          set((state) => ({
            settings: { ...state.settings, citizenshipStatus },
          })),

        setShouldStoreInput: (shouldStoreInput) =>
          set((state) => ({
            settings: { ...state.settings, shouldStoreInput },
          })),

        setLatestIncomeCeilingDate: (date) =>
          set(() => ({
            latestIncomeCeilingDate: date,
          })),
      }),
      {
        name: "cpf-storage",
        /**
         * Only persist settings when shouldStoreInput is true.
         * This matches the current Jotai atomWithStorage behavior.
         */
        partialize: (state) => ({
          settings: state.settings.shouldStoreInput
            ? state.settings
            : initialSettings,
        }),
      },
    ),
  );
};

/**
 * Type for the store creator function
 */
export type CreateCpfStore = typeof createCpfStore;
