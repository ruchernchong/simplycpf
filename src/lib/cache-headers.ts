/**
 * Cache headers for API routes.
 * CPF policy data can change when new schedules are published or corrected.
 * Cache it at the edge for 24 hours and allow stale responses while the edge
 * refreshes, instead of treating policy as immutable for a year.
 */
export const CACHE_HEADERS = {
  /**
   * Backwards-compatible name for reference endpoints. The response is
   * deliberately not marked immutable.
   */
  immutable: {
    "Cache-Control":
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
  },

  /**
   * For data that depends on query params but is still deterministic.
   * Vercel Edge caches by full URL including query string.
   */
  static: {
    "Cache-Control":
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
  },

  policy: {
    "Cache-Control":
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
  },
} as const;
