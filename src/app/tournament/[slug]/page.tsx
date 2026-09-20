import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MatchCard } from "@/components/public/match-card";
import { PageShell } from "@/components/public/page-shell";
import { StoryLinkList } from "@/components/public/story-link-list";
import {
  getStandingsForTournament,
  getTournamentArticles,
  getTournamentBySlug,
  getTournamentMatches
} from "@/lib/public/sports-catalog";

export const dynamic = "force-dynamic";

type TournamentPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: TournamentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(decodeURIComponent(slug));

  return {
    title: tournament ? `${tournament.nameBn} | Sportsfair` : "টুর্নামেন্ট পাওয়া যায়নি | Sportsfair",
    description: tournament ? `${tournament.nameBn} ম্যাচ, ফলাফল ও পয়েন্ট টেবিল।` : undefined
  };
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(decodeURIComponent(slug));

  if (!tournament) {
    notFound();
  }

  const [matches, tableRows, stories] = await Promise.all([
    getTournamentMatches(tournament.id),
    getStandingsForTournament(tournament.id),
    getTournamentArticles(tournament.id)
  ]);

  return (
    <PageShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-primary">{tournament.sportName ?? "টুর্নামেন্ট"}</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-neutral-950">{tournament.nameBn}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground" href={`/standings/${tournament.slug}`}>
              পয়েন্ট টেবিল
            </Link>
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section>
            <h2 className="text-2xl font-black">ম্যাচ</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {matches.length > 0 ? matches.map((match) => <MatchCard key={match.id} match={match} />) : <Empty text="এই টুর্নামেন্টে কোনো ম্যাচ যোগ করা হয়নি।" />}
            </div>
          </section>

          <aside className="grid content-start gap-6">
            <Panel title="টেবিল">
              {tableRows.length > 0 ? <MiniStanding rows={tableRows.slice(0, 6)} /> : <Empty text="টেবিল যোগ করা হয়নি।" />}
            </Panel>
            <Panel title="সম্পর্কিত খবর">
              <StoryLinkList stories={stories} />
            </Panel>
          </aside>
        </div>
      </main>
    </PageShell>
  );
}

function Panel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MiniStanding({ rows }: { rows: Awaited<ReturnType<typeof getStandingsForTournament>> }) {
  return (
    <div className="grid gap-2">
      {rows.map((row) => (
        <Link className="grid grid-cols-[1fr_48px] rounded-md border p-3 text-sm hover:text-primary" href={`/team/${row.teamSlug}`} key={row.id}>
          <span className="font-bold">{row.teamName}</span>
          <span className="text-right font-black">{row.points}</span>
        </Link>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">{text}</p>;
}
