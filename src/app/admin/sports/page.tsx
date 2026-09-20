import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { AdminFrame } from "@/components/admin/admin-frame";
import {
  addMatchCommentaryAction,
  createManualMatchAction,
  deleteMatchAction,
  importCricsheetJsonAction,
  importOpenFootballUrlAction,
  updateMatchScoreAction
} from "@/app/admin/sports/actions";
import { db } from "@/db";
import { matches, sports, teams } from "@/db/schema";
import { requireStaffSession } from "@/lib/auth-guard";
import { formatBanglaDate } from "@/lib/public/content";

export const dynamic = "force-dynamic";

export default async function AdminSportsPage() {
  const session = await requireStaffSession(["admin", "editor", "journalist"]);
  const recentMatches = await db
    .select({
      id: matches.id,
      titleBn: matches.titleBn,
      slug: matches.slug,
      status: matches.status,
      startsAt: matches.startsAt,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      scoreSummary: matches.scoreSummary,
      liveSummary: matches.liveSummary,
      broadcastInfo: matches.broadcastInfo,
      sourceProvider: matches.sourceProvider,
      sportName: sports.nameBn,
      homeTeam: teams.nameBn
    })
    .from(matches)
    .leftJoin(sports, eq(matches.sportId, sports.id))
    .leftJoin(teams, eq(matches.homeTeamId, teams.id))
    .orderBy(desc(matches.startsAt))
    .limit(20);

  return (
    <AdminFrame
      description="Manual match control plus free-source imports from Cricsheet and OpenFootball."
      session={session}
      title="Sports data"
    >
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="grid gap-6">
          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">Catalog</h2>
            <p className="mt-1 text-sm text-muted-foreground">Manage teams, players, tournaments, seasons and standings.</p>
            <Link className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" href="/admin/sports/catalog">
              Open sports catalog
            </Link>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">Create manual match</h2>
            <form action={createManualMatchAction} className="mt-4 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-medium">
                  Sport
                  <select className="rounded-md border bg-background px-3 py-2" name="sport">
                    <option value="cricket">Cricket</option>
                    <option value="football">Football</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Status
                  <select className="rounded-md border bg-background px-3 py-2" name="status">
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="postponed">Postponed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
              </div>
              <label className="grid gap-1 text-sm font-medium">
                Title
                <input className="rounded-md border bg-background px-3 py-2" name="titleBn" placeholder="বাংলাদেশ বনাম ভারত" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="rounded-md border bg-background px-3 py-2" name="homeTeam" placeholder="Home team" required />
                <input className="rounded-md border bg-background px-3 py-2" name="awayTeam" placeholder="Away team" required />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="rounded-md border bg-background px-3 py-2" name="tournament" placeholder="Tournament" />
                <input className="rounded-md border bg-background px-3 py-2" name="season" placeholder="Season" />
              </div>
              <input className="rounded-md border bg-background px-3 py-2" name="startsAt" type="datetime-local" required />
              <input className="rounded-md border bg-background px-3 py-2" name="venueBn" placeholder="Venue" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="rounded-md border bg-background px-3 py-2" name="homeScore" placeholder="Home score" />
                <input className="rounded-md border bg-background px-3 py-2" name="awayScore" placeholder="Away score" />
              </div>
              <input className="rounded-md border bg-background px-3 py-2" name="scoreSummary" placeholder="Score summary" />
              <input className="rounded-md border bg-background px-3 py-2" name="liveSummary" placeholder="Live summary" />
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Create match</button>
            </form>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">Import Cricsheet JSON</h2>
            <p className="mt-1 text-sm text-muted-foreground">Paste one Cricsheet JSON match from an allowed download.</p>
            <form action={importCricsheetJsonAction} className="mt-4 grid gap-3">
              <input className="rounded-md border bg-background px-3 py-2" name="sourceId" placeholder="Optional source id" />
              <textarea className="min-h-40 rounded-md border bg-background px-3 py-2 font-mono text-xs" name="payload" required />
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Import cricket match</button>
            </form>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">Import OpenFootball URL</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use raw GitHub URLs from the openfootball organization.</p>
            <form action={importOpenFootballUrlAction} className="mt-4 grid gap-3">
              <input
                className="rounded-md border bg-background px-3 py-2"
                name="url"
                placeholder="https://raw.githubusercontent.com/openfootball/football.json/master/2026-27/en.1.json"
                required
                type="url"
              />
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Import football fixtures</button>
            </form>
          </section>
        </div>

        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-lg font-semibold">Recent matches</h2>
          <div className="mt-4 grid gap-4">
            {recentMatches.map((match) => (
              <article className="rounded-md border p-4" key={match.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-primary">{match.sportName ?? "Sport"} · {match.status}</p>
                    <Link className="text-lg font-semibold hover:text-primary" href={`/match/${encodeURIComponent(match.slug)}`}>
                      {match.titleBn}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatBanglaDate(match.startsAt)} · {match.sourceProvider ?? "manual"}
                    </p>
                  </div>
                  <form action={deleteMatchAction.bind(null, match.id)}>
                    <button className="rounded-md border border-destructive px-3 py-2 text-sm font-medium text-destructive">Delete</button>
                  </form>
                </div>
                <form action={updateMatchScoreAction.bind(null, match.id)} className="mt-4 grid gap-3 md:grid-cols-3">
                  <select className="rounded-md border bg-background px-3 py-2" name="status" defaultValue={match.status}>
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="postponed">Postponed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <input className="rounded-md border bg-background px-3 py-2" name="homeScore" defaultValue={match.homeScore ?? ""} placeholder="Home score" />
                  <input className="rounded-md border bg-background px-3 py-2" name="awayScore" defaultValue={match.awayScore ?? ""} placeholder="Away score" />
                  <input className="rounded-md border bg-background px-3 py-2 md:col-span-2" name="scoreSummary" defaultValue={match.scoreSummary ?? ""} placeholder="Score summary" />
                  <input className="rounded-md border bg-background px-3 py-2" name="liveSummary" defaultValue={match.liveSummary ?? ""} placeholder="Live summary" />
                  <input className="rounded-md border bg-background px-3 py-2 md:col-span-2" name="broadcastInfo" defaultValue={match.broadcastInfo ?? ""} placeholder="Broadcast info" />
                  <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Update score</button>
                </form>
                <form action={addMatchCommentaryAction.bind(null, match.id)} className="mt-3 grid gap-3 md:grid-cols-[120px_1fr_180px]">
                  <input className="rounded-md border bg-background px-3 py-2" name="clock" placeholder="Clock" />
                  <input className="rounded-md border bg-background px-3 py-2" name="bodyBn" placeholder="Commentary update" />
                  <input className="rounded-md border bg-background px-3 py-2" name="scoreSnapshot" placeholder="Score snapshot" />
                  <button className="rounded-md border px-4 py-2 text-sm font-semibold md:col-span-3">Add commentary</button>
                </form>
              </article>
            ))}
            {recentMatches.length === 0 ? (
              <p className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">No matches yet.</p>
            ) : null}
          </div>
        </section>
      </div>
    </AdminFrame>
  );
}
