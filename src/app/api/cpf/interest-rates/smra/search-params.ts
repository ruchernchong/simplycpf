import { createLoader, parseAsFloat } from "nuqs/server";

export const searchParams = {
  averageSgsYield: parseAsFloat,
  /** @deprecated Use averageSgsYield. */
  sgsYield: parseAsFloat,
};

export const loadSearchParams = createLoader(searchParams);
