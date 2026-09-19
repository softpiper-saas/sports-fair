import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { ArticleImage } from "@/components/public/article-image";
import { PageShell } from "@/components/public/page-shell";
import { formatBanglaDate, getPublishedVideos } from "@/lib/public/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ভিডিও | Sportsfair",
  description: "Sportsfair-এর প্রকাশিত ভিডিও।"
};

export default async function VideosPage() {
  const videos = await getPublishedVideos(24);

  return (
    <PageShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-neutral-200 pb-5">
          <p className="text-sm font-bold text-primary">মিডিয়া</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-neutral-950">ভিডিও</h1>
        </header>

        <section className="mt-6">
          {videos.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <Link key={video.id} href={video.videoUrl} className="group overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
                  <div className="relative aspect-video bg-neutral-100">
                    <ArticleImage src={video.thumbnailUrl} alt={video.thumbnailAlt || video.titleBn} />
                    <span className="absolute inset-0 grid place-items-center bg-black/20 text-white">
                      <PlayCircle className="size-12 drop-shadow" />
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-bold text-primary">{video.categoryName || "ভিডিও"}</p>
                    <h2 className="mt-2 text-xl font-black leading-snug transition group-hover:text-primary">{video.titleBn}</h2>
                    {video.description ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{video.description}</p> : null}
                    <p className="mt-4 text-xs font-medium text-muted-foreground">{formatBanglaDate(video.publishedAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8">
              <h2 className="text-2xl font-black">এখনো কোনো ভিডিও প্রকাশিত হয়নি</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">অ্যাডমিন প্যানেল থেকে ভিডিও প্রকাশ করলে এখানে দেখা যাবে।</p>
            </div>
          )}
        </section>
      </main>
    </PageShell>
  );
}
