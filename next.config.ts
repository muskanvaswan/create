import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @buffd/next ships ESM + RSC ("use client") files; let Next transpile and
  // resolve them like first-party code while it's consumed as a workspace.
  transpilePackages: ["@buffd/next"],
};

export default nextConfig;
