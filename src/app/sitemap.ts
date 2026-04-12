import type { MetadataRoute } from "next";
import { source } from "@/app/(docs)/lib/source";
import { BASE_URL } from "@/config";

const MAIN_PAGES: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    lastModified: "2025-03-15",
    changeFrequency: "monthly",
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/calculator`,
    lastModified: "2025-03-15",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/interest-rates`,
    lastModified: "2025-01-01",
    changeFrequency: "yearly",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/investments`,
    lastModified: "2025-03-15",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/about`,
    lastModified: "2025-02-01",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/docs`,
    lastModified: "2025-03-15",
    changeFrequency: "weekly",
    priority: 0.6,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const docsPages = source.getPages().map((page) => ({
    url: `${BASE_URL}/docs/${page.slugs.join("/")}`,
    lastModified: "2025-03-15",
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...MAIN_PAGES, ...docsPages];
}
