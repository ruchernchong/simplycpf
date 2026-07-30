import type { MetadataRoute } from "next";
import { source } from "@/app/(docs)/lib/source";
import { BASE_URL } from "@/config";

/**
 * Build-time constant rather than `new Date()` per entry. Stamping every URL
 * with "today" on every build tells crawlers the whole site changed daily,
 * which is noise, the signal is worth more when it is honest.
 */
const lastModified = new Date(process.env.VERCEL_GIT_COMMIT_DATE ?? Date.now());

/** Public product and reference pages, in rough order of importance. */
const routes = [
  "",
  "/calculator",
  "/projection",
  "/what-if",
  "/cpf-life",
  "/cpf-at-55",
  "/accrued-interest",
  "/cpf-check",
  "/cpf-cheat-sheet",
  "/retirement-readiness",
  "/interest-rates",
  "/investments",
  "/about",
  "/privacy",
  "/faq",
  "/faq/general",
  "/faq/contribution-rates",
  "/faq/projection",
  "/faq/cpf-life",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified,
  }));

  /*
   * Every page under content/docs, not just the /docs index. These are
   * enumerable from the Fumadocs loader, so they cannot drift out of sync with
   * the content the way a hand-maintained list would.
   */
  const docs = source.getPages().map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified,
  }));

  return [...pages, ...docs];
}
