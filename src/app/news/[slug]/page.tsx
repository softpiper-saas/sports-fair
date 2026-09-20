import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleEngagement } from "@/components/public/article-engagement";
import { ArticleImage } from "@/components/public/article-image";
import { PageShell } from "@/components/public/page-shell";
import { formatBanglaDate, getArticleBySlug, getPublishedArticles } from "@/lib/public/content";
import { jsonLdScript } from "@/lib/seo/json-ld";
import { siteName, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type NewsPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(decodeURIComponent(slug));

  if (!article) {
    return {
      title: "খবর পাওয়া যায়নি | Sportsfair"
    };
  }

  return {
    title: article.seoTitle || `${article.headlineBn} | Sportsfair`,
    description: article.seoDescription || article.summary || undefined,
    alternates: article.canonicalUrl ? { canonical: article.canonicalUrl } : undefined,
    openGraph: {
      title: article.seoTitle || article.headlineBn,
      description: article.seoDescription || article.summary || undefined,
      images: article.imageUrl ? [article.imageUrl] : undefined
    }
  };
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(decodeURIComponent(slug));

  if (!article) {
    notFound();
  }

  const related = (await getPublishedArticles(6)).filter((item) => item.slug !== article.slug).slice(0, 4);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.headlineBn,
    description: article.seoDescription || article.summary || undefined,
    image: article.imageUrl ? [article.imageUrl] : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: (article.contentUpdatedAt || article.publishedAt)?.toISOString(),
    author: {
      "@type": "Person",
      name: article.authorName || `${siteName} ডেস্ক`
    },
    publisher: {
      "@type": "Organization",
      name: siteName
    },
    mainEntityOfPage: siteUrl(`/news/${article.slug}`)
  };

  return (
    <PageShell>
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
        <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <header>
            <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
              {article.breaking !== "normal" ? <span className="rounded bg-red-600 px-2 py-1 text-white">ব্রেকিং</span> : null}
              {article.categoryName ? (
                <Link
                  href={`/section/${encodeURIComponent(article.categorySlug || "")}`}
                  className="rounded bg-emerald-50 px-2 py-1 text-primary"
                >
                  {article.categoryName}
                </Link>
              ) : null}
            </div>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-normal text-neutral-950 sm:text-5xl">{article.headlineBn}</h1>
            {article.summary ? <p className="mt-4 text-lg leading-8 text-neutral-700">{article.summary}</p> : null}
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium text-muted-foreground">
              {article.authorName ? <span>রিপোর্ট: {article.authorName}</span> : <span>Sportsfair ডেস্ক</span>}
              <time dateTime={(article.publishedAt || new Date()).toISOString()}>{formatBanglaDate(article.publishedAt)}</time>
              {article.contentUpdatedAt ? <span>আপডেট: {formatBanglaDate(article.contentUpdatedAt)}</span> : null}
            </div>
            <ArticleEngagement articleId={article.id} title={article.headlineBn} />
          </header>

          <figure className="mt-7 overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <div className="relative aspect-[16/10] bg-neutral-100">
              <ArticleImage src={article.imageUrl} alt={article.imageAlt || article.headlineBn} priority />
            </div>
            {article.imageCaption || article.imageCredit ? (
              <figcaption className="px-4 py-3 text-xs leading-5 text-muted-foreground">
                {article.imageCaption}
                {article.imageCaption && article.imageCredit ? " | " : ""}
                {article.imageCredit ? `ছবি: ${article.imageCredit}` : ""}
              </figcaption>
            ) : null}
          </figure>

          <div
            className="prose prose-neutral mt-8 max-w-none text-lg leading-8 prose-headings:font-black prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: article.bodyHtml || "<p>বিস্তারিত কনটেন্ট শিগগিরই যোগ হবে।</p>" }}
          />
        </article>

        <section className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
          <h2 className="border-t border-neutral-200 pt-6 text-2xl font-black">আরও পড়ুন</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((item) => (
              <Link key={item.id} href={`/news/${encodeURIComponent(item.slug)}`} className="rounded-lg border border-neutral-200 bg-white p-4 font-extrabold leading-snug transition hover:text-primary">
                {item.headlineBn}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
