import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker/Cloud Run
  output: "standalone",

  // React compiler for performance
  reactCompiler: true,

  // Experimental features
  experimental: {
    // Server Actions are stable in Next.js 14+
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Optimize images for Cloud Run
  images: {
    unoptimized: process.env.NODE_ENV === "development",
  },

  // Environment variable validation
  env: {
    NEXT_PUBLIC_WEBAUTHN_RP_NAME: process.env.NEXT_PUBLIC_WEBAUTHN_RP_NAME || "GambleGuard",
  },
};

export default nextConfig;
