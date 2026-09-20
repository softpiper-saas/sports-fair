"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { matchCommentary, matches } from "@/db/schema";
import { formDate, formString, nullableFormString } from "@/lib/form-data";
import { requireStaffSession } from "@/lib/auth-guard";
import { ensureSlug } from "@/lib/slug";
import { normalizeCricsheetMatch, normalizeOpenFootballFromUrl } from "@/lib/sports/free-providers";
import { importNormalizedMatch, importNormalizedMatches } from "@/lib/sports/importer";
import type { NormalizedMatch } from "@/lib/sports/provider-types";

const matchStatusSchema = z.enum(["scheduled", "live", "completed", "postponed", "cancelled"]);
const sportSchema = z.enum(["cricket", "football"]);

export async function createManualMatchAction(formData: FormData) {
  await requireStaffSession(["admin", "editor", "journalist"]);
  const sport = sportSchema.parse(formString(formData, "sport") || "cricket");
  const homeName = formString(formData, "homeTeam");
  const awayName = formString(formData, "awayTeam");
  const startsAt = formDate(formData, "startsAt") ?? new Date();
  const titleBn = formString(formData, "titleBn") || `${homeName} বনাম ${awayName}`;

  if (!homeName || !awayName) {
    throw new Error("Home and away teams are required.");
  }

  const normalized: NormalizedMatch = {
    provider: "manual",
    sourceId: crypto.randomUUID(),
    sport:
      sport === "cricket"
        ? { nameBn: "ক্রিকেট", nameEn: "Cricket", slug: "cricket" }
        : { nameBn: "ফুটবল", nameEn: "Football", slug: "football" },
    tournament: {
      nameBn: formString(formData, "tournament") || (sport === "cricket" ? "Cricket" : "Football"),
      slug: ensureSlug(null, formString(formData, "tournament") || sport)
    },
    season: {
      nameBn: formString(formData, "season") || String(startsAt.getFullYear()),
      startsAt: new Date(Date.UTC(startsAt.getFullYear(), 0, 1)),
      endsAt: new Date(Date.UTC(startsAt.getFullYear(), 11, 31))
    },
    homeTeam: { nameBn: homeName, nameEn: homeName, slug: ensureSlug(null, homeName) },
    awayTeam: { nameBn: awayName, nameEn: awayName, slug: ensureSlug(null, awayName) },
    titleBn,
    titleEn: `${homeName} vs ${awayName}`,
    slug: ensureSlug(formString(formData, "slug"), `${titleBn}-${startsAt.toISOString().slice(0, 10)}`),
    status: matchStatusSchema.parse(formString(formData, "status") || "scheduled"),
    startsAt,
    venueBn: nullableFormString(formData, "venueBn"),
    venueEn: nullableFormString(formData, "venueEn"),
    homeScore: nullableFormString(formData, "homeScore"),
    awayScore: nullableFormString(formData, "awayScore"),
    scoreSummary: nullableFormString(formData, "scoreSummary"),
    liveSummary: nullableFormString(formData, "liveSummary")
  };

  await importNormalizedMatch(normalized);
  revalidateSportsPaths();
  redirect("/admin/sports");
}

export async function updateMatchScoreAction(matchId: string, formData: FormData) {
  await requireStaffSession(["admin", "editor", "journalist"]);

  await db
    .update(matches)
    .set({
      status: matchStatusSchema.parse(formString(formData, "status") || "scheduled"),
      homeScore: nullableFormString(formData, "homeScore"),
      awayScore: nullableFormString(formData, "awayScore"),
      scoreSummary: nullableFormString(formData, "scoreSummary"),
      liveSummary: nullableFormString(formData, "liveSummary"),
      broadcastInfo: nullableFormString(formData, "broadcastInfo"),
      updatedAt: new Date()
    })
    .where(eq(matches.id, matchId));

  revalidateSportsPaths();
}

export async function addMatchCommentaryAction(matchId: string, formData: FormData) {
  const session = await requireStaffSession(["admin", "editor", "journalist"]);
  const bodyBn = formString(formData, "bodyBn");

  if (!bodyBn) {
    throw new Error("Commentary text is required.");
  }

  const [latest] = await db
    .select({ sequence: matchCommentary.sequence })
    .from(matchCommentary)
    .where(eq(matchCommentary.matchId, matchId))
    .orderBy(desc(matchCommentary.sequence))
    .limit(1);

  await db.insert(matchCommentary).values({
    matchId,
    sequence: (latest?.sequence ?? 0) + 1,
    clock: nullableFormString(formData, "clock"),
    bodyBn,
    scoreSnapshot: nullableFormString(formData, "scoreSnapshot"),
    createdById: session.user.id
  });

  revalidateSportsPaths();
}

export async function importCricsheetJsonAction(formData: FormData) {
  await requireStaffSession(["admin", "editor"]);
  const payload = formString(formData, "payload");

  if (!payload) {
    throw new Error("Cricsheet JSON payload is required.");
  }

  const parsed = JSON.parse(payload) as unknown;
  const sourceId = nullableFormString(formData, "sourceId") ?? crypto.randomUUID();
  await importNormalizedMatches([normalizeCricsheetMatch(parsed, sourceId)]);

  revalidateSportsPaths();
  redirect("/admin/sports");
}

export async function importOpenFootballUrlAction(formData: FormData) {
  await requireStaffSession(["admin", "editor"]);
  const url = formString(formData, "url");

  if (!url || !url.startsWith("https://raw.githubusercontent.com/openfootball/")) {
    throw new Error("Use a raw.githubusercontent.com/openfootball URL for OpenFootball imports.");
  }

  const normalized = await normalizeOpenFootballFromUrl(url);
  await importNormalizedMatches(normalized);

  revalidateSportsPaths();
  redirect("/admin/sports");
}

export async function deleteMatchAction(matchId: string) {
  await requireStaffSession(["admin", "editor"]);

  await db.delete(matches).where(eq(matches.id, matchId));
  revalidateSportsPaths();
}

function revalidateSportsPaths() {
  revalidatePath("/");
  revalidatePath("/admin/sports");
  revalidatePath("/live");
  revalidatePath("/schedule");
  revalidatePath("/results");
}
