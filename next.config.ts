import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // TODO: Fix all TS errors and remove this
  },
  reactStrictMode: true,
  allowedDevOrigins: [
    "preview-chat-49115291-a838-4227-95cc-449077415d58.space.z.ai",
  ],
};

export default nextConfig;
