import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e"],
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/components/ui/**",
        "src/app/robots.ts",
        "src/app/sitemap.ts",
        "src/app/error.tsx",
        "src/app/not-found.tsx",
        "src/app/providers.tsx",
        "src/app/**/layout.tsx",
        "**/\\(docs\\)/**",
        "src/proxy.ts",
        "src/types/**",
        // OG/Favicon image generation
        "src/app/apple-icon.tsx",
        "src/app/icon.tsx",
        "src/app/opengraph-image.tsx",
        "src/app/twitter-image.tsx",
        // Page components (presentational, better for e2e)
        "src/app/\\(main\\)/**/page.tsx",
        "src/app/\\(main\\)/**/loading.tsx",
        "src/app/\\(main\\)/**/error.tsx",
        // Zustand stores and providers (require React context)
        "src/providers/**",
        "src/stores/**",
        // Hooks (require React context and mocking)
        "src/hooks/**",
        // PDF generation (requires @react-pdf/renderer mocking)
        "src/lib/download-pdf.tsx",
        "src/components/pdf/**",
        // SEO components (static structured data)
        "src/components/seo/**",
        // Search API (uses fumadocs library)
        "src/app/api/search/**",
        // New route files (static markdown generation)
        "src/app/cpf-rates.md/**",
        // Engagement components (require browser APIs and context mocking)
        "src/components/calculator/share-results.tsx",
        "src/components/calculator/url-params-sync.tsx",
        "src/components/calculator/ceiling-change-reminder.tsx",
        "src/components/calculator/ceiling-comparison-card.tsx",
        // Complex UI components (require Jotai/charts/form mocking)
        "src/components/about/**",
        "src/components/calculator/**",
        "src/components/home/**",
        "src/components/interest-rates/**",
        "src/components/investments/**",
        "src/components/projection/**",
        "src/components/timeline/**",
        "src/components/what-if/**",
        "src/components/cpf-life/**",
        "src/components/lead-magnets/**",
        "src/components/at-55/**",
        "src/components/check/**",
        "src/components/housing/**",
        "src/components/cheat-sheet/**",
        "src/components/shared/**",
        // Layout components requiring context mocking
        "src/components/layout/theme-toggle.tsx",
        "src/components/layout/header.tsx",
        // Error boundary (requires complex error simulation)
        "src/components/error-fallback.tsx",
        // Logo mark (presentational sub-component)
        "src/lib/logo-mark.tsx",
        // Image generation (Next.js dynamic OG/favicon)
        "src/lib/icon-image.tsx",
        "src/lib/og-image.tsx",
        // PostHog server (analytics, requires API key mocking)
        "src/lib/posthog-server.ts",
        // Income ceiling date finder (edge case with all-future dates)
        "src/lib/find-latest-income-ceiling-date.ts",
        // Format utility (pre-existing, requires locale mocking)
        "src/lib/format.ts",
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
