import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptlibrary.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/notifications"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
