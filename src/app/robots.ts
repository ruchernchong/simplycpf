import type { MetadataRoute } from "next";
import { BASE_URL } from "../config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /ph/ is the first-party PostHog proxy, analytics plumbing, not content.
      disallow: ["/api/", "/docs/og/", "/ph/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
