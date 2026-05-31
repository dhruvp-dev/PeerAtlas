import { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let papers: any[] = [];
  try {
    papers = await fetchQuery(api.papers.getAllIds);
  } catch (error) {
    console.error("Failed to fetch papers for sitemap:", error);
  }

  const paperRoutes = papers.map((p) => ({
    url: `https://peeratlas.qzz.io/paper/${p._id}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: "yearly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://peeratlas.qzz.io",
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: "https://peeratlas.qzz.io/browse",
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://peeratlas.qzz.io/about",
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...paperRoutes,
  ];
}
