import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-49115291-a838-4227-95cc-449077415d58.space.z.ai",
    /.+\.space\.z\.ai$/,
  ],
};

export default nextConfig;
