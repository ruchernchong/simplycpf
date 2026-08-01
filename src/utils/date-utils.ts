export const formatDateInput = (
  rawInput: string,
  _existingValue?: string,
): string => {
  // Remove any non-digit characters
  const cleanedInput = rawInput.replace(/\D/g, "");

  // Limit to 6 characters (MMYYYY)
  const trimmedInput = cleanedInput.slice(0, 6);

  // Format input
  if (trimmedInput.length <= 2) {
    return trimmedInput;
  }
  if (trimmedInput.length <= 4) {
    return `${trimmedInput.slice(0, 2)}/${trimmedInput.slice(2)}`;
  }
  return `${trimmedInput.slice(0, 2)}/${trimmedInput.slice(2, 6)}`;
};

export const isValidDateFormat = (date: string): boolean => {
  const regex = /^(0[1-9]|1[0-2])\/\d{4}$/;
  if (!regex.test(date)) return false;

  const [month, year] = date.split("/").map(Number);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  return (
    month >= 1 &&
    month <= 12 &&
    year > 1900 &&
    (year < currentYear || (year === currentYear && month <= currentMonth))
  );
};
