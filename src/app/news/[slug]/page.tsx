import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/public/ad-slot";
import { ArticleEngagement } from "@/components/public/article-engagement";
import { ArticleImage } from "@/components/public/article-image";
import { PageShell } from "@/components/public/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitCommentAction, votePollAction } from "@/app/news/[slug]/actions";
import { formatBanglaDate, getArticleBySlug, getPublishedArticles } from "@/lib/public/content";
import { getActiveArticlePoll, getApprovedComments } from "@/lib/public/engagement";
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

  const [relatedArticles, comments, poll] = await Promise.all([
    getPublishedArticles(6),
    getApprovedComments(article.id),
    getActiveArticlePoll(article.id)
  ]);
  const related = relatedArticles.filter((item) => item.slug !== article.slug).slice(0, 4);
  const submitComment = submitCommentAction.bind(null, article.id, article.slug);
  const votePoll = votePollAction.bind(null, article.id, article.slug);
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
              {article.sponsored ? (
                <span className="rounded bg-amber-100 px-2 py-1 text-amber-800">
                  স্পনসরড{article.sponsorName ? `: ${article.sponsorName}` : ""}
                </span>
              ) : null}
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

          <AdSlot className="mt-6" pageType="article" sectionSlug={article.categorySlug} slotKey="article-header" />

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

          <AdSlot className="mt-8" pageType="article" sectionSlug={article.categorySlug} slotKey="article-in-article" />

          <div
            className="prose prose-neutral mt-8 max-w-none text-lg leading-8 prose-headings:font-black prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: article.bodyHtml || "<p>বিস্তারিত কনটেন্ট শিগগিরই যোগ হবে।</p>" }}
          />

          <AdSlot className="mt-8" pageType="article" sectionSlug={article.categorySlug} slotKey="article-sidebar" />
        </article>

        <section className="mx-auto grid max-w-4xl gap-6 px-4 pb-12 sm:px-6 lg:px-8">
          {poll ? <ArticlePoll poll={poll} action={votePoll} /> : null}
          <ArticleComments comments={comments} action={submitComment} />
        </section>

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

type ArticlePollProps = {
  action: (formData: FormData) => void | Promise<void>;
  poll: NonNullable<Awaited<ReturnType<typeof getActiveArticlePoll>>>;
};

function ArticlePoll({ action, poll }: ArticlePollProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">পাঠক জরিপ</h2>
      <p className="mt-2 text-lg font-bold text-neutral-900">{poll.questionBn}</p>
      <form action={action} className="mt-4 grid gap-3">
        {poll.options.map((option) => {
          const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;

          return (
            <label className="rounded-md border border-neutral-200 p-3" key={option.id}>
              <span className="flex items-center gap-3">
                <input name="optionId" required type="radio" value={option.id} />
                <span className="font-bold">{option.labelBn}</span>
                <span className="ml-auto text-sm text-muted-foreground">{percentage}%</span>
              </span>
              <span className="mt-2 block h-2 overflow-hidden rounded-full bg-neutral-100">
                <span className="block h-full bg-primary" style={{ width: `${percentage}%` }} />
              </span>
            </label>
          );
        })}
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">{poll.totalVotes} ভোট</span>
          <Button type="submit">ভোট দিন</Button>
        </div>
      </form>
    </div>
  );
}

type ArticleCommentsProps = {
  action: (formData: FormData) => void | Promise<void>;
  comments: Awaited<ReturnType<typeof getApprovedComments>>;
};

function ArticleComments({ action, comments }: ArticleCommentsProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">মন্তব্য</h2>
      <form action={action} className="mt-4 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="authorName" placeholder="আপনার নাম" required />
          <Input name="authorEmail" placeholder="ইমেইল (ঐচ্ছিক)" type="email" />
        </div>
        <textarea
          className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          maxLength={1200}
          name="body"
          placeholder="আপনার মন্তব্য লিখুন"
          required
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">মন্তব্য প্রকাশের আগে মডারেশন করা হবে।</p>
          <Button type="submit">মন্তব্য পাঠান</Button>
        </div>
      </form>

      <div className="mt-6 divide-y divide-neutral-200">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <article className="py-4" key={comment.id}>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-bold">{comment.authorName}</span>
                <time className="text-muted-foreground" dateTime={comment.createdAt.toISOString()}>
                  {formatBanglaDate(comment.createdAt)}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-800">{comment.body}</p>
            </article>
          ))
        ) : (
          <p className="py-4 text-sm text-muted-foreground">এখনো কোনো অনুমোদিত মন্তব্য নেই।</p>
        )}
      </div>
    </div>
  );
}
