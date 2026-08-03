/**
 * Automatically format the birthdate from MMYYYY to MM/YYYY
 * e.g. 012023 to 01/2023
 *
 * @param rawInput
 * @param birthDate
 */
export const formatDateInput = (
  rawInput: string,
  birthDate: string,
): string => {
  let formattedInput = rawInput;
  if (formattedInput.length === 2 && birthDate.length === 3) {
    formattedInput = `${formattedInput.slice(0, 1)}/${formattedInput.slice(1, 2)}`;
  } else {
    formattedInput = formattedInput.replace(/[^0-9]/g, "");

    if (formattedInput.length > 2) {
      formattedInput = `${formattedInput.substring(0, 2)}/${formattedInput.substring(2)}`;
    }
  }

  return formattedInput;
};
