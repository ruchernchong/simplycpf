import type { MetadataRoute } from "next";
import { BASE_URL } from "@/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/calculator`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/interest-rates`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/investments`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/docs`,
      lastModified: new Date(),
    },
  ];
}
