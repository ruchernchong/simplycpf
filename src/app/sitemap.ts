import type { MetadataRoute } from "next";
import { BASE_URL } from "@/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: BASE_URL,
      lastModified,
    },
    {
      url: `${BASE_URL}/calculator`,
      lastModified,
    },
    {
      url: `${BASE_URL}/calculator?age=35`,
      lastModified,
    },
    {
      url: `${BASE_URL}/calculator?age=55`,
      lastModified,
    },
    {
      url: `${BASE_URL}/calculator?age=65`,
      lastModified,
    },
    {
      url: `${BASE_URL}/projection`,
      lastModified,
    },
    {
      url: `${BASE_URL}/what-if`,
      lastModified,
    },
    {
      url: `${BASE_URL}/cpf-life`,
      lastModified,
    },
    {
      url: `${BASE_URL}/cpf-cheat-sheet`,
      lastModified,
    },
    {
      url: `${BASE_URL}/retirement-readiness`,
      lastModified,
    },
    {
      url: `${BASE_URL}/interest-rates`,
      lastModified,
    },
    {
      url: `${BASE_URL}/investments`,
      lastModified,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified,
    },
    {
      url: `${BASE_URL}/docs`,
      lastModified,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified,
    },
    {
      url: `${BASE_URL}/faq/general`,
      lastModified,
    },
    {
      url: `${BASE_URL}/faq/contribution-rates`,
      lastModified,
    },
    {
      url: `${BASE_URL}/faq/projection`,
      lastModified,
    },
    {
      url: `${BASE_URL}/faq/cpf-life`,
      lastModified,
    },
  ];
}
