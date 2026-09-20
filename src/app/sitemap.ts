import type { MetadataRoute } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, matches, players, teams, tournaments } from "@/db/schema";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/latest",
    "/live",
    "/schedule",
    "/results",
    "/teams",
    "/players",
    "/tournaments",
    "/videos",
    "/photos",
    "/search"
  ].map((path) => ({
    url: siteUrl(path || "/"),
    lastModified: now,
    changeFrequency: path === "" ? "hourly" : "daily",
    priority: path === "" ? 1 : 0.8
  }));

  const [articleRows, matchRows, teamRows, playerRows, tournamentRows] = await Promise.all([
    db
      .select({ slug: articles.slug, updatedAt: articles.updatedAt })
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.updatedAt))
      .limit(500),
    db.select({ slug: matches.slug, updatedAt: matches.updatedAt }).from(matches).orderBy(desc(matches.updatedAt)).limit(500),
    db.select({ slug: teams.slug, updatedAt: teams.updatedAt }).from(teams).orderBy(desc(teams.updatedAt)).limit(300),
    db.select({ slug: players.slug, updatedAt: players.updatedAt }).from(players).orderBy(desc(players.updatedAt)).limit(300),
    db.select({ slug: tournaments.slug, updatedAt: tournaments.updatedAt }).from(tournaments).orderBy(desc(tournaments.updatedAt)).limit(300)
  ]);

  return [
    ...staticRoutes,
    ...articleRows.map((item) => ({
      url: siteUrl(`/news/${item.slug}`),
      lastModified: item.updatedAt,
      changeFrequency: "hourly" as const,
      priority: 0.9
    })),
    ...matchRows.map((item) => ({
      url: siteUrl(`/match/${item.slug}`),
      lastModified: item.updatedAt,
      changeFrequency: "hourly" as const,
      priority: 0.8
    })),
    ...teamRows.map((item) => ({
      url: siteUrl(`/team/${item.slug}`),
      lastModified: item.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7
    })),
    ...playerRows.map((item) => ({
      url: siteUrl(`/player/${item.slug}`),
      lastModified: item.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.6
    })),
    ...tournamentRows.flatMap((item) => [
      {
        url: siteUrl(`/tournament/${item.slug}`),
        lastModified: item.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.7
      },
      {
        url: siteUrl(`/standings/${item.slug}`),
        lastModified: item.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.7
      }
    ])
  ];
}
