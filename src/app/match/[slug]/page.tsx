import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarClock, MapPin, Radio, Tv } from "lucide-react";
import { PageShell } from "@/components/public/page-shell";
import { formatBanglaDate } from "@/lib/public/content";
import { getMatchBySlug, getMatchCommentary } from "@/lib/public/matches";

export const dynamic = "force-dynamic";

type MatchPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const match = await getMatchBySlug(decodeURIComponent(slug));

  return {
    title: match ? `${match.titleBn} | Sportsfair` : "ম্যাচ পাওয়া যায়নি | Sportsfair",
    description: match?.scoreSummary || match?.liveSummary || undefined
  };
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { slug } = await params;
  const match = await getMatchBySlug(decodeURIComponent(slug));

  if (!match) {
    notFound();
  }

  const commentary = await getMatchCommentary(match.id);

  return (
    <PageShell>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded bg-emerald-50 px-2 py-1 text-primary">{match.sportName ?? "খেলা"}</span>
            {match.status === "live" ? (
              <span className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-white">
                <Radio className="size-3" />
                লাইভ
              </span>
            ) : (
              <span className="rounded bg-neutral-100 px-2 py-1 text-neutral-700">{match.status}</span>
            )}
          </div>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-normal text-neutral-950">{match.titleBn}</h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">{match.tournamentName ?? "Sportsfair"}</p>

          <section className="mt-6 grid gap-4 rounded-lg bg-neutral-950 p-5 text-white sm:grid-cols-2">
            <ScoreBlock label={match.homeTeam ?? "Home"} score={match.homeScore} />
            <ScoreBlock label={match.awayTeam ?? "Away"} score={match.awayScore} />
          </section>
          {match.scoreSummary || match.liveSummary ? (
            <p className="mt-4 text-base font-bold text-neutral-800">{match.liveSummary || match.scoreSummary}</p>
          ) : null}

          <div className="mt-5 grid gap-3 text-sm font-medium text-muted-foreground sm:grid-cols-3">
            <span className="inline-flex items-center gap-2">
              <CalendarClock className="size-4" />
              {formatBanglaDate(match.startsAt)}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4" />
              {match.venueBn || "ভেন্যু নির্ধারিত নয়"}
            </span>
            <span className="inline-flex items-center gap-2">
              <Tv className="size-4" />
              {match.broadcastInfo || "সম্প্রচার তথ্য নেই"}
            </span>
          </div>
        </header>

        <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black">লাইভ আপডেট</h2>
          <div className="mt-4 grid gap-3">
            {commentary.length > 0 ? (
              commentary.map((item) => (
                <article className="rounded-md border border-neutral-200 p-4" key={item.id}>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
                    {item.clock ? <span>{item.clock}</span> : null}
                    {item.scoreSnapshot ? <span>{item.scoreSnapshot}</span> : null}
                  </div>
                  <p className="mt-2 text-base font-semibold leading-7 text-neutral-900">{item.bodyBn}</p>
                </article>
              ))
            ) : (
              <p className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">এই ম্যাচে এখনো কোনো লাইভ আপডেট নেই।</p>
            )}
          </div>
        </section>
      </main>
    </PageShell>
  );
}

function ScoreBlock({ label, score }: { label: string; score: string | null }) {
  return (
    <div className="rounded-md border border-white/15 bg-white/5 p-4">
      <p className="text-sm font-bold text-neutral-300">{label}</p>
      <p className="mt-2 text-3xl font-black">{score || "-"}</p>
    </div>
  );
}
