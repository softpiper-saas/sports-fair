import Link from "next/link";
import { ArrowRight, Radio } from "lucide-react";
import { PageShell } from "@/components/public/page-shell";
import { StoryCard } from "@/components/public/story-card";
import {
  getBreakingArticles,
  getFeaturedArticles,
  getPublishedArticles,
  getPublishedGalleries,
  getPublishedVideos
} from "@/lib/public/content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [latest, featured, breaking, videos, galleries] = await Promise.all([
    getPublishedArticles(14),
    getFeaturedArticles(5),
    getBreakingArticles(5),
    getPublishedVideos(4),
    getPublishedGalleries(4)
  ]);
  const lead = featured[0] ?? latest[0];
  const secondary = latest.filter((article) => article.id !== lead?.id).slice(0, 4);
  const moreStories = latest.filter((article) => article.id !== lead?.id).slice(4, 12);

  return (
    <PageShell>
      <main>
        <section className="border-b border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm font-bold text-red-700">
              <Radio className="size-4" />
              লাইভ আপডেট
            </div>
            <div className="flex gap-4 overflow-x-auto pb-1 text-sm font-semibold text-neutral-800">
              {breaking.length > 0 ? (
                breaking.map((item) => (
                  <Link key={item.id} href={`/news/${encodeURIComponent(item.slug)}`} className="min-w-64 hover:text-primary">
                    {item.headlineBn}
                  </Link>
                ))
              ) : (
                <span>এখনো কোনো ব্রেকিং আপডেট নেই। প্রকাশিত হলে এখানে দেখা যাবে।</span>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
          {lead ? (
            <StoryCard article={lead} variant="lead" />
          ) : (
            <EmptyPanel title="প্রথম প্রকাশের অপেক্ষা" body="অ্যাডমিন প্যানেল থেকে একটি আর্টিকেল প্রকাশ করলেই এখানে প্রধান খবর দেখা যাবে।" />
          )}

          <aside className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h2 className="text-lg font-black">সর্বশেষ</h2>
              <Link href="/latest" className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                সব দেখুন <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="divide-y divide-neutral-200">
              {secondary.length > 0 ? (
                secondary.map((article) => (
                  <Link
                    key={article.id}
                    href={`/news/${encodeURIComponent(article.slug)}`}
                    className="block py-4 text-base font-extrabold leading-snug transition hover:text-primary"
                  >
                    {article.headlineBn}
                  </Link>
                ))
              ) : (
                <p className="py-5 text-sm leading-6 text-muted-foreground">আরও খবর প্রকাশের পর এই তালিকা আপডেট হবে।</p>
              )}
            </div>
          </aside>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <SectionHeader title="আজকের খেলা" href="/latest" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {moreStories.length > 0 ? (
              moreStories.map((article) => <StoryCard key={article.id} article={article} />)
            ) : (
              <EmptyPanel title="খবর আসছে" body="ক্যাটাগরি ও আর্টিকেল প্রকাশ করলে এই অংশটি স্বয়ংক্রিয়ভাবে পূর্ণ হবে।" />
            )}
          </div>
        </section>

        <section className="mt-8 bg-neutral-950 text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <SectionHeader title="ভিডিও" href="/videos" inverted />
              <div className="grid gap-4 sm:grid-cols-2">
                {videos.length > 0 ? (
                  videos.map((video) => (
                    <Link key={video.id} href={video.videoUrl} className="rounded-lg border border-white/15 bg-white/5 p-4 transition hover:bg-white/10">
                      <p className="text-xs font-bold text-emerald-300">{video.categoryName || "ভিডিও"}</p>
                      <h3 className="mt-2 text-lg font-black leading-snug">{video.titleBn}</h3>
                      {video.description ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-300">{video.description}</p> : null}
                    </Link>
                  ))
                ) : (
                  <p className="rounded-lg border border-white/15 p-4 text-sm text-neutral-300">প্রকাশিত ভিডিও এখানে দেখা যাবে।</p>
                )}
              </div>
            </div>

            <div>
              <SectionHeader title="ছবির গল্প" href="/photos" inverted />
              <div className="grid gap-4 sm:grid-cols-2">
                {galleries.length > 0 ? (
                  galleries.map((gallery) => (
                    <Link key={gallery.id} href="/photos" className="rounded-lg border border-white/15 bg-white/5 p-4 transition hover:bg-white/10">
                      <p className="text-xs font-bold text-emerald-300">{gallery.categoryName || "গ্যালারি"}</p>
                      <h3 className="mt-2 text-lg font-black leading-snug">{gallery.titleBn}</h3>
                      {gallery.description ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-300">{gallery.description}</p> : null}
                    </Link>
                  ))
                ) : (
                  <p className="rounded-lg border border-white/15 p-4 text-sm text-neutral-300">প্রকাশিত ছবির গ্যালারি এখানে দেখা যাবে।</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

function SectionHeader({ title, href, inverted = false }: { title: string; href: string; inverted?: boolean }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className={`text-2xl font-black ${inverted ? "text-white" : "text-neutral-950"}`}>{title}</h2>
      <Link href={href} className={`inline-flex items-center gap-1 text-sm font-bold ${inverted ? "text-emerald-300" : "text-primary"}`}>
        আরও <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8">
      <h2 className="text-2xl font-black text-neutral-950">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}
