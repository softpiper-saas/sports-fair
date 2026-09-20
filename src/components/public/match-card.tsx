import Link from "next/link";
import { CalendarClock, Radio } from "lucide-react";
import { formatBanglaDate } from "@/lib/public/content";
import type { PublicMatch } from "@/lib/public/matches";

export function MatchCard({ match }: { match: PublicMatch }) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="rounded bg-emerald-50 px-2 py-1 text-primary">{match.sportName ?? "খেলা"}</span>
          {match.status === "live" ? (
            <span className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-white">
              <Radio className="size-3" />
              লাইভ
            </span>
          ) : (
            <span className="rounded bg-neutral-100 px-2 py-1 text-neutral-700">{statusLabel(match.status)}</span>
          )}
        </div>
        <span className="text-xs font-medium text-muted-foreground">{match.sourceProvider ?? "manual"}</span>
      </div>

      <Link href={`/match/${encodeURIComponent(match.slug)}`}>
        <h2 className="mt-3 text-xl font-black leading-snug text-neutral-950 transition hover:text-primary">
          {match.titleBn}
        </h2>
      </Link>
      <p className="mt-1 text-sm text-muted-foreground">{match.tournamentName ?? "Sportsfair"}</p>

      <div className="mt-4 grid gap-2 rounded-md bg-neutral-50 p-3">
        <ScoreLine label={match.homeTeam ?? "Home"} score={match.homeScore} />
        <ScoreLine label={match.awayTeam ?? "Away"} score={match.awayScore} />
      </div>

      {match.scoreSummary || match.liveSummary ? (
        <p className="mt-3 text-sm font-semibold text-neutral-800">{match.liveSummary || match.scoreSummary}</p>
      ) : null}

      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <CalendarClock className="size-4" />
        <time dateTime={match.startsAt.toISOString()}>{formatBanglaDate(match.startsAt)}</time>
      </div>
    </article>
  );
}

function ScoreLine({ label, score }: { label: string; score: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-semibold text-neutral-700">{label}</span>
      <span className="font-black text-neutral-950">{score || "-"}</span>
    </div>
  );
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    scheduled: "সূচি",
    completed: "ফলাফল",
    postponed: "স্থগিত",
    cancelled: "বাতিল"
  };

  return labels[status] ?? status;
}
