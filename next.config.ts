import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@distube/ytdl-core"],
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
