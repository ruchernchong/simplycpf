/**
 * Cache headers for API routes.
 * CPF policy data can change when new schedules are published or corrected.
 * Cache it at the edge for 24 hours and allow stale responses while the edge
 * refreshes, instead of treating policy as immutable for a year.
 */
export const CACHE_HEADERS = {
  policy: {
    "Cache-Control":
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
  },
} as const;
