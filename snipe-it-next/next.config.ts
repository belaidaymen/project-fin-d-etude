import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["*.replit.dev", "*.replit.app"],
    },
  },
  allowedDevOrigins: [
    "*.spock.replit.dev",
    "*.worf.replit.dev",
    "*.janeway.replit.dev",
    "*.riker.replit.dev",
    "*.replit.dev",
    "*.replit.app",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
