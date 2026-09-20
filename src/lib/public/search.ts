import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { articles, matches, players, teams, tournaments } from "@/db/schema";

export type SearchResults = Awaited<ReturnType<typeof searchSite>>;

export async function searchSite(query: string) {
  const q = query.trim();

  if (q.length < 2) {
    return {
      articles: [],
      teams: [],
      players: [],
      tournaments: [],
      matches: []
    };
  }

  const pattern = `%${q}%`;

  const [articleRows, teamRows, playerRows, tournamentRows, matchRows] = await Promise.all([
    db
      .select({
        id: articles.id,
        title: articles.headlineBn,
        slug: articles.slug,
        summary: articles.summary,
        publishedAt: articles.publishedAt
      })
      .from(articles)
      .where(
        and(
          eq(articles.status, "published"),
          or(
            ilike(articles.headlineBn, pattern),
            ilike(articles.headlineEn, pattern),
            ilike(articles.summary, pattern),
            ilike(articles.bodyHtml, pattern)
          )
        )
      )
      .orderBy(desc(articles.publishedAt))
      .limit(12),
    db
      .select({
        id: teams.id,
        title: teams.nameBn,
        subtitle: teams.country,
        slug: teams.slug
      })
      .from(teams)
      .where(or(ilike(teams.nameBn, pattern), ilike(teams.nameEn, pattern), ilike(teams.country, pattern)))
      .orderBy(teams.nameBn)
      .limit(8),
    db
      .select({
        id: players.id,
        title: players.nameBn,
        subtitle: players.role,
        slug: players.slug
      })
      .from(players)
      .where(or(ilike(players.nameBn, pattern), ilike(players.nameEn, pattern), ilike(players.country, pattern), ilike(players.role, pattern)))
      .orderBy(players.nameBn)
      .limit(8),
    db
      .select({
        id: tournaments.id,
        title: tournaments.nameBn,
        subtitle: tournaments.nameEn,
        slug: tournaments.slug
      })
      .from(tournaments)
      .where(or(ilike(tournaments.nameBn, pattern), ilike(tournaments.nameEn, pattern)))
      .orderBy(tournaments.nameBn)
      .limit(8),
    db
      .select({
        id: matches.id,
        title: matches.titleBn,
        subtitle: matches.scoreSummary,
        slug: matches.slug,
        startsAt: matches.startsAt
      })
      .from(matches)
      .where(or(ilike(matches.titleBn, pattern), ilike(matches.titleEn, pattern), ilike(matches.venueBn, pattern), ilike(matches.liveSummary, pattern)))
      .orderBy(desc(matches.startsAt))
      .limit(8)
  ]);

  return {
    articles: articleRows,
    teams: teamRows,
    players: playerRows,
    tournaments: tournamentRows,
    matches: matchRows
  };
}
