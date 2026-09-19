import { asc } from "drizzle-orm";
import { createArticleAction } from "@/app/admin/cms-actions";
import { AdminFrame } from "@/components/admin/admin-frame";
import { ArticleForm } from "@/components/admin/article-form";
import { db } from "@/db";
import { categories, mediaAssets } from "@/db/schema";
import { requireStaffSession } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const session = await requireStaffSession(["admin", "editor", "journalist"]);
  const [categoryRows, mediaRows] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.nameBn)),
    db.select().from(mediaAssets).orderBy(asc(mediaAssets.objectKey))
  ]);

  return (
    <AdminFrame description="Create a Bangla sports story with editorial metadata." session={session} title="New article">
      <ArticleForm action={createArticleAction} categories={categoryRows} media={mediaRows} />
    </AdminFrame>
  );
}
