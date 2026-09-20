import { and, asc, desc, eq, gte, lt, lte } from "drizzle-orm";
import { aliasedTable } from "drizzle-orm/alias";
import { db } from "@/db";
import { matchCommentary, matches, sports, teams, tournaments } from "@/db/schema";

export type PublicMatch = Awaited<ReturnType<typeof getMatchesForList>>[number];

const homeTeams = aliasedTable(teams, "home_teams");
const awayTeams = aliasedTable(teams, "away_teams");

const matchSelect = {
  id: matches.id,
  titleBn: matches.titleBn,
  titleEn: matches.titleEn,
  slug: matches.slug,
  status: matches.status,
  startsAt: matches.startsAt,
  venueBn: matches.venueBn,
  venueEn: matches.venueEn,
  broadcastInfo: matches.broadcastInfo,
  homeScore: matches.homeScore,
  awayScore: matches.awayScore,
  scoreSummary: matches.scoreSummary,
  liveSummary: matches.liveSummary,
  sourceProvider: matches.sourceProvider,
  sportName: sports.nameBn,
  sportSlug: sports.slug,
  tournamentName: tournaments.nameBn,
  homeTeam: homeTeams.nameBn,
  awayTeam: awayTeams.nameBn
};

export async function getMatchesForList(kind: "live" | "schedule" | "results", limit = 40) {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfTomorrow = new Date(startOfToday);
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 2);

  const where =
    kind === "live"
      ? eq(matches.status, "live")
      : kind === "results"
        ? eq(matches.status, "completed")
        : and(gte(matches.startsAt, startOfToday), lt(matches.startsAt, endOfTomorrow));

  return db
    .select(matchSelect)
    .from(matches)
    .leftJoin(sports, eq(matches.sportId, sports.id))
    .leftJoin(tournaments, eq(matches.tournamentId, tournaments.id))
    .leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
    .leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
    .where(where)
    .orderBy(kind === "results" ? desc(matches.startsAt) : asc(matches.startsAt))
    .limit(limit);
}

export async function getMatchBySlug(slug: string) {
  const [match] = await db
    .select(matchSelect)
    .from(matches)
    .leftJoin(sports, eq(matches.sportId, sports.id))
    .leftJoin(tournaments, eq(matches.tournamentId, tournaments.id))
    .leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
    .leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
    .where(eq(matches.slug, slug))
    .limit(1);

  return match ?? null;
}

export async function getUpcomingMatches(limit = 6) {
  return db
    .select(matchSelect)
    .from(matches)
    .leftJoin(sports, eq(matches.sportId, sports.id))
    .leftJoin(tournaments, eq(matches.tournamentId, tournaments.id))
    .leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
    .leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
    .where(and(gte(matches.startsAt, new Date()), lte(matches.startsAt, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))))
    .orderBy(asc(matches.startsAt))
    .limit(limit);
}

export async function getMatchCommentary(matchId: string) {
  return db
    .select({
      id: matchCommentary.id,
      sequence: matchCommentary.sequence,
      clock: matchCommentary.clock,
      bodyBn: matchCommentary.bodyBn,
      scoreSnapshot: matchCommentary.scoreSnapshot,
      createdAt: matchCommentary.createdAt
    })
    .from(matchCommentary)
    .where(eq(matchCommentary.matchId, matchId))
    .orderBy(desc(matchCommentary.sequence));
}
