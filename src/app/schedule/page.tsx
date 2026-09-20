import { MatchCard } from "@/components/public/match-card";
import { PageShell } from "@/components/public/page-shell";
import { getMatchesForList } from "@/lib/public/matches";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ম্যাচ সূচি | Sportsfair",
  description: "আজ ও আগামীকালের ম্যাচ সূচি।"
};

export default async function SchedulePage() {
  const matches = await getMatchesForList("schedule");

  return (
    <PageShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-neutral-200 pb-5">
          <p className="text-sm font-bold text-primary">সূচি</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-neutral-950">ম্যাচ সূচি</h1>
        </header>
        <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {matches.length > 0 ? matches.map((match) => <MatchCard key={match.id} match={match} />) : <EmptyState text="আজ ও আগামীকালের কোনো ম্যাচ যোগ করা হয়নি।" />}
        </section>
      </main>
    </PageShell>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-sm text-muted-foreground">{text}</p>;
}
