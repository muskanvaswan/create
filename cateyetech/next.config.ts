import type { NextConfig } from "next";
import { services } from "./src/content/site";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // The previous site published these services at the site root. Keep the old
  // URLs working so existing links and search results do not break.
  async redirects() {
    return [
      ...services.map((service) => ({
        source: service.legacyPath,
        destination: `/services/${service.slug}`,
        permanent: true,
      })),
      {
        source: "/cio-on-demand-as-a-service",
        destination: "/services/on-demand-it-leadership",
        permanent: true,
      },
      {
        source: "/cto-on-demand-as-a-service",
        destination: "/services/on-demand-it-leadership",
        permanent: true,
      },
      {
        source: "/ciso-on-demand-as-a-service",
        destination: "/services/on-demand-it-leadership",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
