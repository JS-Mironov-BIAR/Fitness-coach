import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/settings";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/anketa`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
