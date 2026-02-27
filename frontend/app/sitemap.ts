import type { MetadataRoute } from "next";
import { MOCK_PROMPTS, MOCK_TRENDING_DEVS } from "@/lib/mock-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptlibrary.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrls: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/requests`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/prompts/new`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const promptUrls: MetadataRoute.Sitemap = MOCK_PROMPTS.map((prompt) => ({
    url: `${SITE_URL}/prompts/${prompt.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const profileUrls: MetadataRoute.Sitemap = MOCK_TRENDING_DEVS.map((dev) => ({
    url: `${SITE_URL}/profile/${dev.username}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...baseUrls, ...promptUrls, ...profileUrls];
}
