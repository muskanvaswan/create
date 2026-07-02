import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @buffd/next ships ESM + RSC ("use client") files; let Next transpile and
  // resolve them like first-party code while it's consumed as a workspace.
  transpilePackages: ["@buffd/next"],
  // Pin the Turbopack root to this project. Without it, Next can infer the wrong
  // workspace root when a sibling lockfile exists (e.g. a git worktree under a
  // parent repo), which makes the dev server fail to resolve this app's routes.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
