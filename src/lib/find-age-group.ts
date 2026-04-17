import { ageGroups } from "../data";
import type { AgeGroup } from "../types";

export const findAgeGroup = <T extends AgeGroup = AgeGroup>(
  age: number,
  groups: T[] = ageGroups as T[],
): T => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const ageGroup = groups[i];
    if (age === ageGroup.minAge) {
      return ageGroup;
    }
  }

  for (const ageGroup of groups) {
    if (
      age > ageGroup.minAge &&
      (age <= Number(ageGroup.maxAge) || !ageGroup.maxAge)
    ) {
      return ageGroup;
    }
  }

  return groups[0];
};
