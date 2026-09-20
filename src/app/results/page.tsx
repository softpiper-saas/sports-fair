import { MatchCard } from "@/components/public/match-card";
import { PageShell } from "@/components/public/page-shell";
import { getMatchesForList } from "@/lib/public/matches";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ফলাফল | Sportsfair",
  description: "Sportsfair ম্যাচ ফলাফল।"
};

export default async function ResultsPage() {
  const matches = await getMatchesForList("results");

  return (
    <PageShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-neutral-200 pb-5">
          <p className="text-sm font-bold text-primary">ফলাফল</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-neutral-950">ম্যাচ ফলাফল</h1>
        </header>
        <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {matches.length > 0 ? matches.map((match) => <MatchCard key={match.id} match={match} />) : <EmptyState text="এখনো কোনো ফলাফল যোগ করা হয়নি।" />}
        </section>
      </main>
    </PageShell>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-sm text-muted-foreground">{text}</p>;
}
