import { eq } from "drizzle-orm";
import { db } from "@/db";
import { matches, seasons, sports, teams, tournaments } from "@/db/schema";
import { ensureSlug } from "@/lib/slug";
import type { ImportSummary, NormalizedMatch } from "@/lib/sports/provider-types";

export async function importNormalizedMatches(input: NormalizedMatch[]): Promise<ImportSummary> {
  let imported = 0;
  let skipped = 0;
  const provider = input[0]?.provider ?? "manual";

  for (const item of input) {
    try {
      await importNormalizedMatch(item);
      imported += 1;
    } catch {
      skipped += 1;
    }
  }

  return { imported, skipped, provider };
}

export async function importNormalizedMatch(item: NormalizedMatch) {
  const sport = await upsertSport(item.sport);
  const homeTeam = await upsertTeam(sport.id, item.homeTeam, item.provider);
  const awayTeam = await upsertTeam(sport.id, item.awayTeam, item.provider);
  const tournament = item.tournament ? await upsertTournament(sport.id, item.tournament, item.provider) : null;
  const season =
    item.season && tournament ? await upsertSeason(tournament.id, item.season, item.provider) : null;

  const values = {
    sportId: sport.id,
    tournamentId: tournament?.id ?? null,
    seasonId: season?.id ?? null,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    titleBn: item.titleBn,
    titleEn: item.titleEn,
    slug: item.slug,
    status: item.status,
    startsAt: item.startsAt,
    venueBn: item.venueBn,
    venueEn: item.venueEn,
    broadcastInfo: null,
    homeScore: item.homeScore,
    awayScore: item.awayScore,
    scoreSummary: item.scoreSummary,
    liveSummary: item.liveSummary,
    sourceProvider: item.provider,
    sourceId: item.sourceId,
    sourceUrl: item.sourceUrl,
    rawPayload: item.rawPayload,
    lastSyncedAt: new Date(),
    updatedAt: new Date()
  };

  await db
    .insert(matches)
    .values(values)
    .onConflictDoUpdate({
      target: [matches.sourceProvider, matches.sourceId],
      set: values
    });
}

async function upsertSport(input: { nameBn: string; nameEn: string; slug: string }) {
  const [existing] = await db.select().from(sports).where(eq(sports.slug, input.slug)).limit(1);

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(sports)
    .values(input)
    .onConflictDoUpdate({
      target: sports.slug,
      set: {
        nameBn: input.nameBn,
        nameEn: input.nameEn,
        updatedAt: new Date()
      }
    })
    .returning();

  if (!created) {
    throw new Error("Sport could not be imported.");
  }

  return created;
}

async function upsertTeam(
  sportId: string,
  input: { nameBn: string; nameEn?: string | null; slug: string; country?: string | null; sourceId?: string | null },
  provider: string
) {
  const slug = input.slug || ensureSlug(null, input.nameBn);

  const [created] = await db
    .insert(teams)
    .values({
      sportId,
      nameBn: input.nameBn,
      nameEn: input.nameEn,
      slug,
      country: input.country,
      sourceProvider: input.sourceId ? provider : null,
      sourceId: input.sourceId
    })
    .onConflictDoUpdate({
      target: teams.slug,
      set: {
        nameBn: input.nameBn,
        nameEn: input.nameEn,
        country: input.country,
        sourceProvider: input.sourceId ? provider : null,
        sourceId: input.sourceId,
        updatedAt: new Date()
      }
    })
    .returning();

  if (!created) {
    throw new Error("Team could not be imported.");
  }

  return created;
}

async function upsertTournament(
  sportId: string,
  input: { nameBn: string; nameEn?: string | null; slug: string; sourceId?: string | null },
  provider: string
) {
  const [created] = await db
    .insert(tournaments)
    .values({
      sportId,
      nameBn: input.nameBn,
      nameEn: input.nameEn,
      slug: input.slug,
      sourceProvider: input.sourceId ? provider : null,
      sourceId: input.sourceId
    })
    .onConflictDoUpdate({
      target: tournaments.slug,
      set: {
        nameBn: input.nameBn,
        nameEn: input.nameEn,
        sourceProvider: input.sourceId ? provider : null,
        sourceId: input.sourceId,
        updatedAt: new Date()
      }
    })
    .returning();

  if (!created) {
    throw new Error("Tournament could not be imported.");
  }

  return created;
}

async function upsertSeason(
  tournamentId: string,
  input: { nameBn: string; nameEn?: string | null; startsAt?: Date | null; endsAt?: Date | null; sourceId?: string | null },
  provider: string
) {
  const sourceId = input.sourceId ?? `${provider}:${tournamentId}:${input.nameBn}`;

  const [created] = await db
    .insert(seasons)
    .values({
      tournamentId,
      nameBn: input.nameBn,
      nameEn: input.nameEn,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      sourceProvider: provider,
      sourceId
    })
    .onConflictDoUpdate({
      target: [seasons.sourceProvider, seasons.sourceId],
      set: {
        nameBn: input.nameBn,
        nameEn: input.nameEn,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        updatedAt: new Date()
      }
    })
    .returning();

  if (!created) {
    throw new Error("Season could not be imported.");
  }

  return created;
}
