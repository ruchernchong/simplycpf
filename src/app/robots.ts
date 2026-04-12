import type { MetadataRoute } from "next";
import { BASE_URL } from "../config";

const AI_BOTS = [
  "ChatGPT-User",
  "Google-Extended",
  "PerplexityBot",
  "ClaudeBot",
  "Bytespider",
  "GPTBot",
  "Applebot-Extended",
  "FacebookBot",
  "cohere-ai",
  " anthropic-ai",
];

export default function robots(): MetadataRoute.Robots {
  const aiBotRules = AI_BOTS.map((bot) => ({
    userAgent: bot.trim(),
    allow: "/",
    disallow: "/api/",
  }));

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/docs/og/"],
      },
      ...aiBotRules,
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
