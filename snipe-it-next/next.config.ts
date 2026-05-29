import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.spock.replit.dev",
    "*.worf.replit.dev",
    "*.janeway.replit.dev",
    "*.replit.dev",
    "*.replit.app",
    "39b798b2-4f45-4300-93f6-e8088767ed39-00-2dilbymrg2o8m.janeway.replit.dev",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
