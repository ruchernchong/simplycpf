import { format, parse } from "date-fns";

type PercentageFormatOptions = {
  decimalPlaces?: number;
};

export const formatCurrency = (
  value: number | string,
  decimalPlaces = 2,
): string => {
  const numericValue = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(numericValue);
};

/**
 * Group-separated number, pinned to en-SG.
 *
 * Prefer this over a bare `value.toLocaleString()`, which follows the server's
 * or the visitor's default locale. That renders differently on the server and
 * the client, a hydration mismatch, and in the SEO content blocks, indexed
 * text that differs from what a reader sees.
 */
export const formatNumber = (
  value: number | string,
  decimalPlaces = 0,
): string => {
  const numericValue = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("en-SG", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(numericValue);
};

export const formatDate = (
  date: Date | string,
  dateFormat = "dd MMMM yyyy",
) => {
  let dateValue: Date;

  if (date instanceof Date) {
    dateValue = date;
  } else {
    // Try different date formats
    try {
      dateValue = parse(date, "yyyy-MM-dd", new Date());
    } catch (_e) {
      try {
        dateValue = parse(date, "MM-dd-yyyy", new Date());
      } catch (_e) {
        // Last resort, use the JS Date constructor
        dateValue = new Date(date);
      }
    }
  }

  return format(dateValue, dateFormat);
};

export const formatPercentage = (
  value: number | string,
  options?: PercentageFormatOptions,
): string => {
  const numericValue = typeof value === "string" ? Number(value) : value;
  const decimalPlaces = options?.decimalPlaces ?? 2;

  return new Intl.NumberFormat("en-SG", {
    style: "percent",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(numericValue);
};
