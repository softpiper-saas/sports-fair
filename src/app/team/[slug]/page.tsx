import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MatchCard } from "@/components/public/match-card";
import { PageShell } from "@/components/public/page-shell";
import { StoryLinkList } from "@/components/public/story-link-list";
import {
  getTeamArticles,
  getTeamBySlug,
  getTeamMatches,
  getTeamPlayers
} from "@/lib/public/sports-catalog";

export const dynamic = "force-dynamic";

type TeamPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { slug } = await params;
  const team = await getTeamBySlug(decodeURIComponent(slug));

  return {
    title: team ? `${team.nameBn} | Sportsfair` : "দল পাওয়া যায়নি | Sportsfair",
    description: team ? `${team.nameBn} দলের খবর, ম্যাচ ও স্কোয়াড।` : undefined
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params;
  const team = await getTeamBySlug(decodeURIComponent(slug));

  if (!team) {
    notFound();
  }

  const [matches, squad, stories] = await Promise.all([
    getTeamMatches(team.id),
    getTeamPlayers(team.id),
    getTeamArticles(team.id)
  ]);

  return (
    <PageShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-primary">{team.sportName ?? "দল"}</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-neutral-950">{team.nameBn}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{team.country || team.nameEn || "Sportsfair team profile"}</p>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section>
            <h2 className="text-2xl font-black">ম্যাচ</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {matches.length > 0 ? matches.map((match) => <MatchCard key={match.id} match={match} />) : <Empty text="এই দলের কোনো ম্যাচ এখনো যোগ করা হয়নি।" />}
            </div>
          </section>

          <aside className="grid content-start gap-6">
            <Panel title="স্কোয়াড">
              {squad.length > 0 ? (
                <div className="grid gap-3">
                  {squad.map((player) => (
                    <Link className="rounded-md border p-3 font-semibold hover:text-primary" href={`/player/${player.slug}`} key={player.id}>
                      {player.nameBn}
                      <span className="block text-xs font-normal text-muted-foreground">{player.teamRole || player.role || "খেলোয়াড়"}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <Empty text="স্কোয়াড যোগ করা হয়নি।" />
              )}
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

function Empty({ text }: { text: string }) {
  return <p className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">{text}</p>;
}
