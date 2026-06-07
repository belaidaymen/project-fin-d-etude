import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.spock.replit.dev",
    "*.worf.replit.dev",
    "*.janeway.replit.dev",
    "*.riker.replit.dev",
    "*.replit.dev",
    "*.replit.app",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: ["*.replit.dev", "*.replit.app"],
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
