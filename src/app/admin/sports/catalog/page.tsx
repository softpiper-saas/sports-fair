import { asc } from "drizzle-orm";
import Link from "next/link";
import { AdminFrame } from "@/components/admin/admin-frame";
import {
  createPlayerAction,
  createSeasonAction,
  createSportAction,
  createTeamAction,
  createTournamentAction,
  upsertStandingAction
} from "@/app/admin/sports/catalog-actions";
import { db } from "@/db";
import { players, seasons, sports, standings, teams, tournaments } from "@/db/schema";
import { requireStaffSession } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function SportsCatalogPage() {
  const session = await requireStaffSession(["admin", "editor", "journalist"]);
  const [sportRows, teamRows, playerRows, tournamentRows, seasonRows, standingRows] = await Promise.all([
    db.select().from(sports).orderBy(asc(sports.nameBn)),
    db.select().from(teams).orderBy(asc(teams.nameBn)).limit(100),
    db.select().from(players).orderBy(asc(players.nameBn)).limit(100),
    db.select().from(tournaments).orderBy(asc(tournaments.nameBn)).limit(100),
    db.select().from(seasons).orderBy(asc(seasons.nameBn)).limit(100),
    db.select().from(standings).orderBy(asc(standings.sortOrder)).limit(100)
  ]);

  return (
    <AdminFrame description="Curate teams, players, tournaments, seasons and tables." session={session} title="Sports catalog">
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="grid gap-6">
          <Panel title="Sport">
            <form action={createSportAction} className="grid gap-3">
              <input className="rounded-md border bg-background px-3 py-2" name="nameBn" placeholder="ক্রিকেট" required />
              <input className="rounded-md border bg-background px-3 py-2" name="nameEn" placeholder="Cricket" />
              <input className="rounded-md border bg-background px-3 py-2" name="slug" placeholder="slug" />
              <Submit>Create sport</Submit>
            </form>
          </Panel>

          <Panel title="Team">
            <form action={createTeamAction} className="grid gap-3">
              <Select name="sportId" options={sportRows.map((sport) => [sport.id, sport.nameBn])} placeholder="Select sport" />
              <input className="rounded-md border bg-background px-3 py-2" name="nameBn" placeholder="Team Bangla name" required />
              <input className="rounded-md border bg-background px-3 py-2" name="nameEn" placeholder="English name" />
              <input className="rounded-md border bg-background px-3 py-2" name="country" placeholder="Country" />
              <input className="rounded-md border bg-background px-3 py-2" name="slug" placeholder="slug" />
              <Submit>Create team</Submit>
            </form>
          </Panel>

          <Panel title="Player">
            <form action={createPlayerAction} className="grid gap-3">
              <input className="rounded-md border bg-background px-3 py-2" name="nameBn" placeholder="Player Bangla name" required />
              <input className="rounded-md border bg-background px-3 py-2" name="nameEn" placeholder="English name" />
              <input className="rounded-md border bg-background px-3 py-2" name="role" placeholder="Role / position" />
              <input className="rounded-md border bg-background px-3 py-2" name="country" placeholder="Country" />
              <input className="rounded-md border bg-background px-3 py-2" name="dateOfBirth" type="date" />
              <Select name="teamId" options={teamRows.map((team) => [team.id, team.nameBn])} placeholder="Optional team" />
              <input className="rounded-md border bg-background px-3 py-2" name="teamRole" placeholder="Team role" />
              <Submit>Create player</Submit>
            </form>
          </Panel>

          <Panel title="Tournament and season">
            <form action={createTournamentAction} className="grid gap-3">
              <Select name="sportId" options={sportRows.map((sport) => [sport.id, sport.nameBn])} placeholder="Select sport" />
              <input className="rounded-md border bg-background px-3 py-2" name="nameBn" placeholder="Tournament Bangla name" required />
              <input className="rounded-md border bg-background px-3 py-2" name="nameEn" placeholder="English name" />
              <input className="rounded-md border bg-background px-3 py-2" name="slug" placeholder="slug" />
              <Submit>Create tournament</Submit>
            </form>
            <form action={createSeasonAction} className="mt-5 grid gap-3 border-t pt-5">
              <Select name="tournamentId" options={tournamentRows.map((tournament) => [tournament.id, tournament.nameBn])} placeholder="Select tournament" />
              <input className="rounded-md border bg-background px-3 py-2" name="nameBn" placeholder="Season name" required />
              <input className="rounded-md border bg-background px-3 py-2" name="nameEn" placeholder="English name" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="rounded-md border bg-background px-3 py-2" name="startsAt" type="datetime-local" />
                <input className="rounded-md border bg-background px-3 py-2" name="endsAt" type="datetime-local" />
              </div>
              <Submit>Create season</Submit>
            </form>
          </Panel>

          <Panel title="Standing row">
            <form action={upsertStandingAction} className="grid gap-3">
              <Select name="tournamentId" options={tournamentRows.map((tournament) => [tournament.id, tournament.nameBn])} placeholder="Select tournament" />
              <Select name="seasonId" options={seasonRows.map((season) => [season.id, season.nameBn])} placeholder="Optional season" />
              <Select name="teamId" options={teamRows.map((team) => [team.id, team.nameBn])} placeholder="Select team" />
              <div className="grid grid-cols-3 gap-3">
                <NumberInput name="played" placeholder="P" />
                <NumberInput name="won" placeholder="W" />
                <NumberInput name="drawn" placeholder="D" />
                <NumberInput name="lost" placeholder="L" />
                <NumberInput name="points" placeholder="Pts" />
                <NumberInput name="goalDifference" placeholder="GD" />
              </div>
              <input className="rounded-md border bg-background px-3 py-2" name="netRunRate" placeholder="NRR" />
              <NumberInput name="sortOrder" placeholder="Sort order" />
              <Submit>Save standing</Submit>
            </form>
          </Panel>
        </div>

        <div className="grid gap-6">
          <ListPanel title="Teams">
            {teamRows.map((team) => (
              <Link className="rounded-md border p-3 hover:bg-secondary" href={`/team/${team.slug}`} key={team.id}>
                <span className="font-semibold">{team.nameBn}</span>
                <span className="block text-xs text-muted-foreground">{team.country || team.nameEn || team.slug}</span>
              </Link>
            ))}
          </ListPanel>
          <ListPanel title="Players">
            {playerRows.map((player) => (
              <Link className="rounded-md border p-3 hover:bg-secondary" href={`/player/${player.slug}`} key={player.id}>
                <span className="font-semibold">{player.nameBn}</span>
                <span className="block text-xs text-muted-foreground">{player.role || player.country || player.slug}</span>
              </Link>
            ))}
          </ListPanel>
          <ListPanel title="Tournaments">
            {tournamentRows.map((tournament) => (
              <Link className="rounded-md border p-3 hover:bg-secondary" href={`/tournament/${tournament.slug}`} key={tournament.id}>
                <span className="font-semibold">{tournament.nameBn}</span>
                <span className="block text-xs text-muted-foreground">{tournament.nameEn || tournament.slug}</span>
              </Link>
            ))}
          </ListPanel>
          <ListPanel title="Standing rows">
            {standingRows.map((row) => (
              <div className="rounded-md border p-3 text-sm" key={row.id}>
                <span className="font-semibold">{row.played} ম্যাচ · {row.points} পয়েন্ট</span>
                <span className="block text-xs text-muted-foreground">W {row.won} · D {row.drawn} · L {row.lost} · NRR {row.netRunRate || "-"}</span>
              </div>
            ))}
          </ListPanel>
        </div>
      </div>
    </AdminFrame>
  );
}

function Panel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function ListPanel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Select({ name, options, placeholder }: { name: string; options: [string, string][]; placeholder: string }) {
  return (
    <select className="rounded-md border bg-background px-3 py-2" name={name}>
      <option value="">{placeholder}</option>
      {options.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

function Submit({ children }: { children: React.ReactNode }) {
  return <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{children}</button>;
}

function NumberInput({ name, placeholder }: { name: string; placeholder: string }) {
  return <input className="rounded-md border bg-background px-3 py-2" name={name} placeholder={placeholder} type="number" />;
}
