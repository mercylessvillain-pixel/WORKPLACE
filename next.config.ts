import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Allows the dev server to be opened through a hosted preview URL.
  allowedDevOrigins: ["*.e2b.app", "*.e2b.dev", "*.vercel.app"],
  serverExternalPackages: ["@electric-sql/pglite", "@electric-sql/pglite-pgvector", "pdf-parse", "postgres"],
  outputFileTracingIncludes: {
    "/api/**": ["./drizzle/**/*.sql"],
  },
  eslint: {
    // Lint is run explicitly via `npm run lint` in CI; don't double-run during build.
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
      {
        // The widget loader and embed frame are intentionally embeddable on customer sites.
        source: "/widget.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300, must-revalidate" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;
