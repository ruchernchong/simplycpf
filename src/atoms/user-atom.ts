import { atom } from "jotai";
import {
  permanentResidentYear1Rates,
  permanentResidentYear2Rates,
} from "../data/permanent-resident-rates";
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

  if (citizenshipStatus === "spr-year1") {
    return findAgeGroup(age, permanentResidentYear1Rates);
  }
  if (citizenshipStatus === "spr-year2") {
    return findAgeGroup(age, permanentResidentYear2Rates);
  }

  // SPR Year 3+ and citizens use full citizen rates
  return findAgeGroup(age);
});
