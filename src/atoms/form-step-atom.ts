import { atom } from "jotai";
import { isValidDateFormat } from "@/utils/date-utils";
import { settingsAtom } from "./setting-atom";

export type FormStep = 0 | 1 | 2 | 3;

export const formStepAtom = atom<FormStep>((get) => {
  const { birthDate, monthlyGrossIncome } = get(settingsAtom);

  const hasValidBirthDate = isValidDateFormat(birthDate);
  const hasValidIncome = monthlyGrossIncome > 0;

  if (!hasValidBirthDate && !hasValidIncome) return 0;
  if (hasValidBirthDate && !hasValidIncome) return 1;
  if (hasValidBirthDate && hasValidIncome) return 2;
  return 0;
});
