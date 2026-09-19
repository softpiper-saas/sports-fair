import { Camera } from "lucide-react";
import { ArticleImage } from "@/components/public/article-image";
import { PageShell } from "@/components/public/page-shell";
import { formatBanglaDate, getPublishedGalleries } from "@/lib/public/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ছবি | Sportsfair",
  description: "Sportsfair-এর ছবির গ্যালারি।"
};

export default async function PhotosPage() {
  const galleries = await getPublishedGalleries(24);

  return (
    <PageShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-neutral-200 pb-5">
          <p className="text-sm font-bold text-primary">মিডিয়া</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-neutral-950">ছবির গল্প</h1>
        </header>

        <section className="mt-6">
          {galleries.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {galleries.map((gallery) => (
                <article key={gallery.id} className="group overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
                  <div className="relative aspect-[4/3] bg-neutral-100">
                    <ArticleImage src={gallery.coverUrl} alt={gallery.coverAlt || gallery.titleBn} />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded bg-black/75 px-3 py-1 text-xs font-bold text-white">
                      <Camera className="size-4" />
                      গ্যালারি
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-bold text-primary">{gallery.categoryName || "ছবি"}</p>
                    <h2 className="mt-2 text-xl font-black leading-snug">{gallery.titleBn}</h2>
                    {gallery.description ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{gallery.description}</p> : null}
                    <p className="mt-4 text-xs font-medium text-muted-foreground">{formatBanglaDate(gallery.publishedAt)}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8">
              <h2 className="text-2xl font-black">এখনো কোনো গ্যালারি প্রকাশিত হয়নি</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">অ্যাডমিন প্যানেল থেকে গ্যালারি প্রকাশ করলে এখানে দেখা যাবে।</p>
            </div>
          )}
        </section>
      </main>
    </PageShell>
  );
}
