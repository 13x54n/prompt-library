import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["cdn.iconscout.com", "images.unsplash.com"],
  },
  allowedDevOrigins: ["localhost:3000", "10.0.0.144:3000"],
};

export default nextConfig;
