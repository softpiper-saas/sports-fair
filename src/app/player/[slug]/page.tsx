import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/public/page-shell";
import { StoryLinkList } from "@/components/public/story-link-list";
import { toBanglaDigits } from "@/lib/slug";
import { getPlayerArticles, getPlayerBySlug, getPlayerTeams } from "@/lib/public/sports-catalog";

export const dynamic = "force-dynamic";

type PlayerPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayerBySlug(decodeURIComponent(slug));

  return {
    title: player ? `${player.nameBn} | Sportsfair` : "খেলোয়াড় পাওয়া যায়নি | Sportsfair",
    description: player ? `${player.nameBn} প্রোফাইল, দল ও খবর।` : undefined
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params;
  const player = await getPlayerBySlug(decodeURIComponent(slug));

  if (!player) {
    notFound();
  }

  const [teams, stories] = await Promise.all([getPlayerTeams(player.id), getPlayerArticles(player.id)]);

  return (
    <PageShell>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-primary">{player.role || "খেলোয়াড়"}</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-neutral-950">{player.nameBn}</h1>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            <span>{player.nameEn || "English name unavailable"}</span>
            <span>{player.country || "Country unavailable"}</span>
            <span>{player.dateOfBirth ? `জন্ম: ${toBanglaDigits(player.dateOfBirth)}` : "জন্মতারিখ নেই"}</span>
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">দল</h2>
            <div className="mt-4 grid gap-3">
              {teams.length > 0 ? (
                teams.map((team) => (
                  <Link className="rounded-md border p-3 font-semibold hover:text-primary" href={`/team/${team.slug}`} key={team.id}>
                    {team.nameBn}
                    <span className="block text-xs font-normal text-muted-foreground">{team.teamRole || "দল"}</span>
                  </Link>
                ))
              ) : (
                <p className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">দল যোগ করা হয়নি।</p>
              )}
            </div>
          </aside>

          <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">সম্পর্কিত খবর</h2>
            <div className="mt-4">
              <StoryLinkList stories={stories} />
            </div>
          </section>
        </div>
      </main>
    </PageShell>
  );
}
