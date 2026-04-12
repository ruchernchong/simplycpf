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
    turbopackFileSystemCacheForBuild: true,
    typedEnv: true,
  },
  async rewrites() {
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/docs/llms.mdx/:path*",
      },
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default withMDX(nextConfig);
