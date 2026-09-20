"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { playerTeams, players, seasons, sports, standings, teams, tournaments } from "@/db/schema";
import { formDate, formInteger, formString, nullableFormString } from "@/lib/form-data";
import { requireStaffSession } from "@/lib/auth-guard";
import { ensureSlug } from "@/lib/slug";

export async function createSportAction(formData: FormData) {
  await requireStaffSession(["admin", "editor"]);
  const nameBn = formString(formData, "nameBn");
  const nameEn = formString(formData, "nameEn") || nameBn;

  if (!nameBn) {
    throw new Error("Sport name is required.");
  }

  await db
    .insert(sports)
    .values({ nameBn, nameEn, slug: ensureSlug(formString(formData, "slug"), nameBn) })
    .onConflictDoNothing();

  revalidateSportsCatalog();
  redirect("/admin/sports/catalog");
}

export async function createTeamAction(formData: FormData) {
  await requireStaffSession(["admin", "editor"]);
  const nameBn = formString(formData, "nameBn");
  const sportId = formString(formData, "sportId");

  if (!nameBn || !sportId) {
    throw new Error("Team name and sport are required.");
  }

  await db
    .insert(teams)
    .values({
      sportId,
      nameBn,
      nameEn: nullableFormString(formData, "nameEn"),
      slug: ensureSlug(formString(formData, "slug"), nameBn),
      country: nullableFormString(formData, "country")
    })
    .onConflictDoNothing();

  revalidateSportsCatalog();
  redirect("/admin/sports/catalog");
}

export async function createPlayerAction(formData: FormData) {
  await requireStaffSession(["admin", "editor"]);
  const nameBn = formString(formData, "nameBn");

  if (!nameBn) {
    throw new Error("Player name is required.");
  }

  const [player] = await db
    .insert(players)
    .values({
      nameBn,
      nameEn: nullableFormString(formData, "nameEn"),
      slug: ensureSlug(formString(formData, "slug"), nameBn),
      country: nullableFormString(formData, "country"),
      role: nullableFormString(formData, "role"),
      dateOfBirth: nullableFormString(formData, "dateOfBirth")
    })
    .onConflictDoNothing()
    .returning();

  const teamId = nullableFormString(formData, "teamId");

  if (player && teamId) {
    await db
      .insert(playerTeams)
      .values({ playerId: player.id, teamId, role: nullableFormString(formData, "teamRole") })
      .onConflictDoNothing();
  }

  revalidateSportsCatalog();
  redirect("/admin/sports/catalog");
}

export async function createTournamentAction(formData: FormData) {
  await requireStaffSession(["admin", "editor"]);
  const nameBn = formString(formData, "nameBn");
  const sportId = formString(formData, "sportId");

  if (!nameBn || !sportId) {
    throw new Error("Tournament name and sport are required.");
  }

  await db
    .insert(tournaments)
    .values({
      sportId,
      nameBn,
      nameEn: nullableFormString(formData, "nameEn"),
      slug: ensureSlug(formString(formData, "slug"), nameBn)
    })
    .onConflictDoNothing();

  revalidateSportsCatalog();
  redirect("/admin/sports/catalog");
}

export async function createSeasonAction(formData: FormData) {
  await requireStaffSession(["admin", "editor"]);
  const tournamentId = formString(formData, "tournamentId");
  const nameBn = formString(formData, "nameBn");

  if (!tournamentId || !nameBn) {
    throw new Error("Season name and tournament are required.");
  }

  await db.insert(seasons).values({
    tournamentId,
    nameBn,
    nameEn: nullableFormString(formData, "nameEn"),
    startsAt: formDate(formData, "startsAt"),
    endsAt: formDate(formData, "endsAt")
  });

  revalidateSportsCatalog();
  redirect("/admin/sports/catalog");
}

export async function upsertStandingAction(formData: FormData) {
  await requireStaffSession(["admin", "editor", "journalist"]);
  const tournamentId = formString(formData, "tournamentId");
  const teamId = formString(formData, "teamId");

  if (!tournamentId || !teamId) {
    throw new Error("Tournament and team are required.");
  }

  const seasonId = nullableFormString(formData, "seasonId");
  const values = {
    tournamentId,
    seasonId,
    teamId,
    played: formInteger(formData, "played") ?? 0,
    won: formInteger(formData, "won") ?? 0,
    drawn: formInteger(formData, "drawn") ?? 0,
    lost: formInteger(formData, "lost") ?? 0,
    points: formInteger(formData, "points") ?? 0,
    goalDifference: formInteger(formData, "goalDifference"),
    netRunRate: nullableFormString(formData, "netRunRate"),
    sortOrder: formInteger(formData, "sortOrder") ?? 0,
    updatedAt: new Date()
  };

  const [existing] = await db
    .select({ id: standings.id })
    .from(standings)
    .where(and(eq(standings.tournamentId, tournamentId), eq(standings.teamId, teamId)))
    .limit(1);

  if (existing) {
    await db.update(standings).set(values).where(eq(standings.id, existing.id));
  } else {
    await db.insert(standings).values(values);
  }

  revalidateSportsCatalog();
  redirect("/admin/sports/catalog");
}

function revalidateSportsCatalog() {
  revalidatePath("/admin/sports/catalog");
  revalidatePath("/teams");
  revalidatePath("/players");
  revalidatePath("/tournaments");
}
