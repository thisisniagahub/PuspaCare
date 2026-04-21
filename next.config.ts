import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-49115291-a838-4227-95cc-449077415d58.space.z.ai",
  ],
};

export default nextConfig;
