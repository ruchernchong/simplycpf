import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
    browserToTerminal: "error",
    serverFunctions: true,
  },
  serverExternalPackages: ["typescript", "twoslash"],
  typedRoutes: true,
  experimental: {
    mcpServer: true,
    strictRouteTypes: true,
    typedEnv: true,
    turbopackRustReactCompiler: true,
  },
  async redirects() {
    return [
      {
        source: "/developer",
        destination: "/docs",
        permanent: true,
      },
      {
        source: "/developer/:path*",
        destination: "/docs/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      afterFiles: [
        {
          // Do not rewrite the Markdown handler's own /docs/llms.mdx URL.
          source: "/docs/:path((?!llms\\.mdx$).*)\\.mdx",
          destination: "/docs/llms.mdx/:path",
        },
        {
          source: "/ph/static/:path*",
          destination: "https://eu-assets.i.posthog.com/static/:path*",
        },
        {
          source: "/ph/:path*",
          destination: "https://eu.i.posthog.com/:path*",
        },
      ],
      fallback: [
        {
          source: "/:path*",
          has: [{ type: "header", key: "x-simplycpf-markdown", value: "1" }],
          destination: "/agent-not-found.md",
        },
      ],
    };
  },
  skipTrailingSlashRedirect: true,
};

export default withMDX(nextConfig);
