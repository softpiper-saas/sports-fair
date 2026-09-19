import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateArticleAction } from "@/app/admin/cms-actions";
import { AdminFrame } from "@/components/admin/admin-frame";
import { ArticleForm } from "@/components/admin/article-form";
import { db } from "@/db";
import { articleTags, articles, categories, mediaAssets, tags } from "@/db/schema";
import { requireStaffSession } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaffSession(["admin", "editor", "journalist"]);
  const { id } = await params;
  const [article] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);

  if (!article) {
    notFound();
  }

  const [categoryRows, mediaRows, tagRows] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.nameBn)),
    db.select().from(mediaAssets).orderBy(asc(mediaAssets.objectKey)),
    db
      .select({
        id: tags.id,
        nameBn: tags.nameBn,
        nameEn: tags.nameEn,
        slug: tags.slug,
        createdAt: tags.createdAt,
        updatedAt: tags.updatedAt
      })
      .from(articleTags)
      .innerJoin(tags, eq(articleTags.tagId, tags.id))
      .where(eq(articleTags.articleId, id))
  ]);

  return (
    <AdminFrame description="Update story content, workflow state and SEO metadata." session={session} title="Edit article">
      <ArticleForm
        action={updateArticleAction.bind(null, article.id)}
        article={article}
        categories={categoryRows}
        media={mediaRows}
        tags={tagRows}
      />
    </AdminFrame>
  );
}
