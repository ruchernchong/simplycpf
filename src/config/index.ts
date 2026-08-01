/**
 * Site origin, with no trailing slash.
 *
 * The localhost fallback matters: without it, an environment where neither
 * NEXT_PUBLIC_BASE_URL nor VERCEL_URL is set resolves to the literal string
 * "https://undefined", which would poison metadataBase, every canonical, the
 * sitemap, robots.txt and every JSON-LD url.
 */
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
  ? process.env.NEXT_PUBLIC_BASE_URL
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

/**
 * Stable @id values for the site-wide JSON-LD nodes declared in the root
 * layout. Page-level WebPage nodes reference WEBSITE_ID via `isPartOf` so the
 * graph links up instead of each page floating unattached.
 */
export const WEBSITE_ID = `${BASE_URL}/#website`;
export const ORGANIZATION_ID = `${BASE_URL}/#organization`;

export const title = "SimplyCPF";
export const description =
  "Calculate source-backed CPF contributions, project balances with explicit assumptions, and review official CPF reference data.";

/**
 * Default Open Graph image, for pages that declare their own `openGraph` block.
 *
 * Next.js replaces the whole `openGraph` object rather than merging it, so a
 * page that sets a title and description but omits `images` ends up with no
 * og:image at all. Spread this into every such page. Pages that ship their own
 * `opengraph-image.tsx` should omit `images` entirely and let the file
 * convention supply its content-hashed URL.
 */
export const OG_IMAGE = {
  url: `${BASE_URL}/opengraph-image`,
  width: 1200,
  height: 630,
  alt: "SimplyCPF. Your CPF, simplified.",
} as const;

export const CPF_TYPE = {
  OA: "OA",
  SA: "SA",
  MA: "MA",
};

export const DEFAULT_EMPLOYEE_CONTRIBUTION_RATE: number = 0.2;
export const DEFAULT_EMPLOYER_CONTRIBUTION_RATE: number = 0.17;
