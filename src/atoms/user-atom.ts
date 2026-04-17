import { atom } from "jotai";
import { prYear1Rates, prYear2Rates } from "../data/pr-rates";
import { convertBirthDateToAge } from "../lib/convert-birth-date-to-age";
import { findAgeGroup } from "../lib/find-age-group";
import type { AgeGroup } from "../types";
import { settingsAtom } from "./setting-atom";

const ageAtom = atom<number>(
  (get) => convertBirthDateToAge(get(settingsAtom).birthDate) || 0,
);

export const ageGroupAtom = atom<AgeGroup>((get) => {
  const age = get(ageAtom);
  const { citizenshipStatus } = get(settingsAtom);

  // Use PR graduated rates for SPR Year 1 and Year 2
  if (citizenshipStatus === "spr-year1") {
    return findAgeGroup(age, prYear1Rates);
  }
  if (citizenshipStatus === "spr-year2") {
    return findAgeGroup(age, prYear2Rates);
  }

  // SPR Year 3+ and citizens use full citizen rates
  return findAgeGroup(age);
});
