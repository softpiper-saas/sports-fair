import { PageShell } from "@/components/public/page-shell";
import { StoryCard } from "@/components/public/story-card";
import { getArticlesByCategorySlug } from "@/lib/public/content";

export const dynamic = "force-dynamic";

type SectionPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SectionPage({ params }: SectionPageProps) {
  const { slug } = await params;
  const requestedSlug = decodeURIComponent(slug);
  const { category, articles } = await getArticlesByCategorySlug(requestedSlug, 36);
  const sectionName = category?.nameBn ?? requestedSlug;

  return (
    <PageShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-neutral-200 pb-5">
          <p className="text-sm font-bold text-primary">বিভাগ</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-neutral-950">{sectionName}</h1>
          {category?.description ? <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{category.description}</p> : null}
        </header>

        <section className="mt-6">
          {articles.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <StoryCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8">
              <h2 className="text-2xl font-black">এই বিভাগে প্রকাশিত খবর নেই</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">নতুন আর্টিকেল প্রকাশ করলে এই পেজ স্বয়ংক্রিয়ভাবে আপডেট হবে।</p>
            </div>
          )}
        </section>
      </main>
    </PageShell>
  );
}
