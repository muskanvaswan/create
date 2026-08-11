import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the Turbopack root to this project. Without it, Next can infer the wrong
  // workspace root when a sibling lockfile exists (e.g. a git worktree under a
  // parent repo), which makes the dev server fail to resolve this app's routes.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
