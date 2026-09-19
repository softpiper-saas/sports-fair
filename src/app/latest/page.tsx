import { PageShell } from "@/components/public/page-shell";
import { StoryCard } from "@/components/public/story-card";
import { getPublishedArticles } from "@/lib/public/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "সর্বশেষ খবর | Sportsfair",
  description: "Sportsfair-এর সর্বশেষ বাংলা স্পোর্টস খবর।"
};

export default async function LatestPage() {
  const articles = await getPublishedArticles(36);

  return (
    <PageShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-neutral-200 pb-5">
          <p className="text-sm font-bold text-primary">Sportsfair</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-neutral-950">সর্বশেষ খবর</h1>
        </header>

        <section className="mt-6">
          {articles.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {articles.map((article) => (
                <StoryCard key={article.id} article={article} variant="horizontal" />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </section>
      </main>
    </PageShell>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8">
      <h2 className="text-2xl font-black">এখনো কোনো প্রকাশিত খবর নেই</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">অ্যাডমিন থেকে আর্টিকেল প্রকাশ করলে সর্বশেষ ফিড এখানে দেখা যাবে।</p>
    </div>
  );
}
