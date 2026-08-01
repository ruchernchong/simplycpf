import { differenceInYears, parse } from "date-fns";

export const convertBirthDateToAge = (birthDate: string): number => {
  const parsedDate = parse(birthDate, "MM/yyyy", new Date());
  const currentDate = new Date();

  return differenceInYears(currentDate, parsedDate);
};

/** Convert the UI's MM/YYYY value to the policy engine's YYYY-MM value. */
export function convertBirthDateToBirthMonth(birthDate: string): string | null {
  const match = /^(0[1-9]|1[0-2])\/(\d{4})$/.exec(birthDate);
  return match ? `${match[2]}-${match[1]}` : null;
}
