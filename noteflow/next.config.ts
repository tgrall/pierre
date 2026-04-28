import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/pierre",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
