import Link from "next/link";
import { Clock } from "lucide-react";
import { ArticleImage } from "@/components/public/article-image";
import { formatBanglaDate, type PublicArticle } from "@/lib/public/content";

type StoryCardProps = {
  article: PublicArticle;
  variant?: "lead" | "compact" | "horizontal";
};

export function StoryCard({ article, variant = "compact" }: StoryCardProps) {
  const href = `/news/${encodeURIComponent(article.slug)}`;

  if (variant === "lead") {
    return (
      <article className="group grid overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm md:grid-cols-[1.1fr_0.9fr]">
        <Link href={href} className="relative block min-h-72 overflow-hidden bg-neutral-100 md:min-h-[460px]">
          <ArticleImage src={article.imageUrl} alt={article.imageAlt || article.headlineBn} priority />
        </Link>
        <div className="flex flex-col justify-end gap-4 p-5 sm:p-7">
          <StoryMeta article={article} />
          <Link href={href}>
            <h1 className="text-3xl font-black leading-tight tracking-normal text-neutral-950 transition group-hover:text-primary sm:text-4xl">
              {article.headlineBn}
            </h1>
          </Link>
          {article.summary ? <p className="text-base leading-7 text-neutral-600">{article.summary}</p> : null}
          <StoryTime article={article} />
        </div>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className="group grid grid-cols-[112px_1fr] gap-4 border-b border-neutral-200 py-4 last:border-b-0 sm:grid-cols-[180px_1fr]">
        <Link href={href} className="relative h-24 overflow-hidden rounded-md bg-neutral-100 sm:h-32">
          <ArticleImage src={article.imageUrl} alt={article.imageAlt || article.headlineBn} />
        </Link>
        <div className="min-w-0">
          <StoryMeta article={article} />
          <Link href={href}>
            <h2 className="mt-2 text-lg font-extrabold leading-snug text-neutral-950 transition group-hover:text-primary sm:text-xl">
              {article.headlineBn}
            </h2>
          </Link>
          {article.summary ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">{article.summary}</p> : null}
          <StoryTime article={article} className="mt-3" />
        </div>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-neutral-100">
        <ArticleImage src={article.imageUrl} alt={article.imageAlt || article.headlineBn} />
      </Link>
      <div className="p-4">
        <StoryMeta article={article} />
        <Link href={href}>
          <h2 className="mt-2 text-xl font-extrabold leading-snug text-neutral-950 transition group-hover:text-primary">
            {article.headlineBn}
          </h2>
        </Link>
        {article.summary ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-600">{article.summary}</p> : null}
        <StoryTime article={article} className="mt-4" />
      </div>
    </article>
  );
}

function StoryMeta({ article }: { article: PublicArticle }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
      {article.breaking !== "normal" ? (
        <span className="rounded bg-red-600 px-2 py-1 text-white">ব্রেকিং</span>
      ) : null}
      {article.categoryName ? (
        <Link
          href={`/section/${encodeURIComponent(article.categorySlug || "")}`}
          className="rounded bg-emerald-50 px-2 py-1 text-primary"
        >
          {article.categoryName}
        </Link>
      ) : (
        <span className="rounded bg-neutral-100 px-2 py-1 text-neutral-600">খেলা</span>
      )}
    </div>
  );
}

function StoryTime({ article, className = "" }: { article: PublicArticle; className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-medium text-muted-foreground ${className}`}>
      <Clock className="size-3.5" />
      <time dateTime={(article.publishedAt || article.updatedAt).toISOString()}>
        {formatBanglaDate(article.publishedAt || article.updatedAt)}
      </time>
    </div>
  );
}
