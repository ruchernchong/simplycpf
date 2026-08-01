import { ageGroups } from "../data";
import type { AgeGroup } from "../types";

/**
 * Resolves completed ages against CPF's inclusive upper age boundaries.
 * Month-after-birthday transitions need a birth month and contribution month;
 * the statutory contribution engine handles that richer case directly.
 */
export function findAgeGroup(age: number): AgeGroup;
export function findAgeGroup<T extends AgeGroup>(
  age: number,
  groups: readonly T[],
): T;
export function findAgeGroup(
  age: number,
  groups: readonly AgeGroup[] = ageGroups,
): AgeGroup {
  const first = groups[0];
  if (!first) {
    throw new Error("At least one CPF age group is required.");
  }

  if (!Number.isFinite(age) || age < 0) return first;

  for (const ageGroup of groups) {
    const aboveLowerBound =
      ageGroup.minAgeExclusive === undefined || age > ageGroup.minAgeExclusive;
    const withinUpperBound =
      ageGroup.maxAgeInclusive === undefined || age <= ageGroup.maxAgeInclusive;
    if (aboveLowerBound && withinUpperBound) return ageGroup;
  }

  return groups.at(-1) ?? first;
}
