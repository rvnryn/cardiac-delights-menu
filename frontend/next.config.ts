import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pfxxnqvaniyadzlizgqf.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/menu-images/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*", // Proxy to your Python backend
      },
    ];
  },
};

export default nextConfig;
