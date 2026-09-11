import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* Addies Exchange — T3 base + migrated Vite components */
  output: "standalone",
  reactStrictMode: true,
  images: {
    domains: ["apnidesidukaan.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [],
  turbopack: {
    resolveAlias: {
      // Route all legacy `react-router-dom` imports through the Next.js compat layer
      "react-router-dom": "./lib/router-compat.tsx",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      // Route all legacy `react-router-dom` imports through the Next.js compat layer
      "react-router-dom": path.resolve(__dirname, "lib/router-compat.tsx"),
    };
    return config;
  },
};

export default nextConfig;
