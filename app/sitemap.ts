import type { MetadataRoute } from "next";
import { getPublishedNews } from "@/src/entities/news";
import { getPublishedProjects } from "@/src/entities/project";
import { absoluteUrl } from "@/src/shared/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    ["/", 1, "weekly"],
    ["/portfolio", 0.9, "weekly"],
    ["/about", 0.7, "monthly"],
    ["/gallery", 0.7, "weekly"],
    ["/news", 0.7, "weekly"],
    ["/partners", 0.6, "monthly"],
    ["/contacts", 0.8, "monthly"],
  ].map(([path, priority, changeFrequency]) => ({
    url: absoluteUrl(path as string),
    lastModified: now,
    priority: priority as number,
    changeFrequency: changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
  }));

  let projects: Awaited<ReturnType<typeof getPublishedProjects>> = [];
  let news: Awaited<ReturnType<typeof getPublishedNews>> = [];

  try {
    [projects, news] = await Promise.all([
      getPublishedProjects(),
      getPublishedNews(),
    ]);
  } catch (error) {
    console.error("[sitemap] Dynamic entries are temporarily unavailable", error);
  }

  return [
    ...staticPages,
    ...projects.map((project) => ({
      url: absoluteUrl(`/portfolio/${project.slug}`),
      lastModified: project.updatedAt ?? project.createdAt ?? now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...news.map((item) => ({
      url: absoluteUrl(`/news/${item.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
