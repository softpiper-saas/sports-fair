import { and, asc, desc, eq, or } from "drizzle-orm";
import { aliasedTable } from "drizzle-orm/alias";
import { db } from "@/db";
import {
  articlePlayers,
  articleTeams,
  articleTournaments,
  articles,
  matches,
  playerTeams,
  players,
  seasons,
  sports,
  standings,
  teams,
  tournaments
} from "@/db/schema";

const homeTeams = aliasedTable(teams, "home_teams");
const awayTeams = aliasedTable(teams, "away_teams");

export async function getTeams(limit = 80) {
  return db
    .select({
      id: teams.id,
      nameBn: teams.nameBn,
      nameEn: teams.nameEn,
      slug: teams.slug,
      country: teams.country,
      sportName: sports.nameBn
    })
    .from(teams)
    .leftJoin(sports, eq(teams.sportId, sports.id))
    .orderBy(asc(teams.nameBn))
    .limit(limit);
}

export async function getPlayers(limit = 80) {
  return db
    .select({
      id: players.id,
      nameBn: players.nameBn,
      nameEn: players.nameEn,
      slug: players.slug,
      country: players.country,
      role: players.role
    })
    .from(players)
    .orderBy(asc(players.nameBn))
    .limit(limit);
}

export async function getTournaments(limit = 80) {
  return db
    .select({
      id: tournaments.id,
      nameBn: tournaments.nameBn,
      nameEn: tournaments.nameEn,
      slug: tournaments.slug,
      sportName: sports.nameBn
    })
    .from(tournaments)
    .leftJoin(sports, eq(tournaments.sportId, sports.id))
    .orderBy(asc(tournaments.nameBn))
    .limit(limit);
}

export async function getTeamBySlug(slug: string) {
  const [team] = await db
    .select({
      id: teams.id,
      nameBn: teams.nameBn,
      nameEn: teams.nameEn,
      slug: teams.slug,
      country: teams.country,
      sportName: sports.nameBn
    })
    .from(teams)
    .leftJoin(sports, eq(teams.sportId, sports.id))
    .where(eq(teams.slug, slug))
    .limit(1);

  return team ?? null;
}

export async function getPlayerBySlug(slug: string) {
  const [player] = await db
    .select({
      id: players.id,
      nameBn: players.nameBn,
      nameEn: players.nameEn,
      slug: players.slug,
      country: players.country,
      role: players.role,
      dateOfBirth: players.dateOfBirth
    })
    .from(players)
    .where(eq(players.slug, slug))
    .limit(1);

  return player ?? null;
}

export async function getTournamentBySlug(slug: string) {
  const [tournament] = await db
    .select({
      id: tournaments.id,
      nameBn: tournaments.nameBn,
      nameEn: tournaments.nameEn,
      slug: tournaments.slug,
      sportName: sports.nameBn
    })
    .from(tournaments)
    .leftJoin(sports, eq(tournaments.sportId, sports.id))
    .where(eq(tournaments.slug, slug))
    .limit(1);

  return tournament ?? null;
}

export async function getTeamMatches(teamId: string, limit = 12) {
  return db
    .select({
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
    })
    .from(matches)
    .leftJoin(sports, eq(matches.sportId, sports.id))
    .leftJoin(tournaments, eq(matches.tournamentId, tournaments.id))
    .leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
    .leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
    .where(or(eq(matches.homeTeamId, teamId), eq(matches.awayTeamId, teamId)))
    .orderBy(desc(matches.startsAt))
    .limit(limit);
}

export async function getTournamentMatches(tournamentId: string, limit = 16) {
  return db
    .select({
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
    })
    .from(matches)
    .leftJoin(sports, eq(matches.sportId, sports.id))
    .leftJoin(tournaments, eq(matches.tournamentId, tournaments.id))
    .leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
    .leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
    .where(eq(matches.tournamentId, tournamentId))
    .orderBy(desc(matches.startsAt))
    .limit(limit);
}

export async function getTeamPlayers(teamId: string) {
  return db
    .select({
      id: players.id,
      nameBn: players.nameBn,
      slug: players.slug,
      role: players.role,
      teamRole: playerTeams.role
    })
    .from(playerTeams)
    .innerJoin(players, eq(playerTeams.playerId, players.id))
    .where(eq(playerTeams.teamId, teamId))
    .orderBy(asc(players.nameBn));
}

export async function getPlayerTeams(playerId: string) {
  return db
    .select({
      id: teams.id,
      nameBn: teams.nameBn,
      slug: teams.slug,
      teamRole: playerTeams.role
    })
    .from(playerTeams)
    .innerJoin(teams, eq(playerTeams.teamId, teams.id))
    .where(eq(playerTeams.playerId, playerId))
    .orderBy(asc(teams.nameBn));
}

export async function getStandingsForTournament(tournamentId: string) {
  return db
    .select({
      id: standings.id,
      played: standings.played,
      won: standings.won,
      drawn: standings.drawn,
      lost: standings.lost,
      points: standings.points,
      goalDifference: standings.goalDifference,
      netRunRate: standings.netRunRate,
      teamName: teams.nameBn,
      teamSlug: teams.slug,
      seasonName: seasons.nameBn
    })
    .from(standings)
    .innerJoin(teams, eq(standings.teamId, teams.id))
    .leftJoin(seasons, eq(standings.seasonId, seasons.id))
    .where(eq(standings.tournamentId, tournamentId))
    .orderBy(asc(standings.sortOrder), desc(standings.points), asc(teams.nameBn));
}

export async function getTeamArticles(teamId: string, limit = 6) {
  return db
    .select({
      id: articles.id,
      headlineBn: articles.headlineBn,
      slug: articles.slug,
      publishedAt: articles.publishedAt
    })
    .from(articleTeams)
    .innerJoin(articles, eq(articleTeams.articleId, articles.id))
    .where(and(eq(articleTeams.teamId, teamId), eq(articles.status, "published")))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function getPlayerArticles(playerId: string, limit = 6) {
  return db
    .select({
      id: articles.id,
      headlineBn: articles.headlineBn,
      slug: articles.slug,
      publishedAt: articles.publishedAt
    })
    .from(articlePlayers)
    .innerJoin(articles, eq(articlePlayers.articleId, articles.id))
    .where(and(eq(articlePlayers.playerId, playerId), eq(articles.status, "published")))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function getTournamentArticles(tournamentId: string, limit = 6) {
  return db
    .select({
      id: articles.id,
      headlineBn: articles.headlineBn,
      slug: articles.slug,
      publishedAt: articles.publishedAt
    })
    .from(articleTournaments)
    .innerJoin(articles, eq(articleTournaments.articleId, articles.id))
    .where(and(eq(articleTournaments.tournamentId, tournamentId), eq(articles.status, "published")))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}
