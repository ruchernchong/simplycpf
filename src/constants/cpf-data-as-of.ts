/**
 * The effective date of the CPF figures shipped in `src/constants` and
 * `src/data`. Surface this anywhere rates or sums are published so a reader,
 * or a crawler, can tell how current the numbers are.
 *
 * Update this whenever a rate, ceiling, retirement sum or BHS value changes,
 * in the same commit as the change.
 *
 * Latest change: contribution and allocation rates for the senior age bands,
 * effective 1 January 2026.
 * https://www.cpf.gov.sg/employer/employer-obligations/how-much-cpf-contributions-to-pay
 */
export const CPF_DATA_AS_OF = "2026-01-01";

/** Human-readable form, for prose and footers. */
export const CPF_DATA_AS_OF_LABEL = "1 January 2026";

/** Calendar year the figures apply to. */
export const CPF_DATA_AS_OF_YEAR = 2026;
