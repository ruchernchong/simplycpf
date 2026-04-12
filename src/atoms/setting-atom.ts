import { atomWithStorage, createJSONStorage } from "jotai/utils";
import type { Settings } from "@/types";

const initialValue: Settings = {
  shouldStoreInput: false,
  monthlyGrossIncome: 0,
  birthDate: "",
};

const storage = createJSONStorage<Settings>(() => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return localStorage;
});

export const settingsAtom = atomWithStorage<Settings>(
  "settings",
  initialValue,
  storage,
);
