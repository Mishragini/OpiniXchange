import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['probo.in', 'gumlet-images-bucket.s3.ap-south-1.amazonaws.com'],
  },
};

export default nextConfig;
