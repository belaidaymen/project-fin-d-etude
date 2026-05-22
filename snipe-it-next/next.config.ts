import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.spock.replit.dev",
    "*.worf.replit.dev",
    "*.replit.dev",
    "*.replit.app",
    "2c82f3bc-6f7d-450d-afb3-091ac7cbba36-00-2itvgghgbvqww.worf.replit.dev",
    "*",
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
