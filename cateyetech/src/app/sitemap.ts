import type { MetadataRoute } from "next";
import { company, services } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/about-us",
    "/services",
    "/careers",
    "/contact-us",
    "/get-started",
    "/privacy-policy",
    "/terms-conditions",
  ];

  return [
    ...staticPaths.map((path) => ({
      url: `${company.url}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...services.map((service) => ({
      url: `${company.url}/services/${service.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
