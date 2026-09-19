import { desc, eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AdminFrame } from "@/components/admin/admin-frame";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { requireStaffSession } from "@/lib/auth-guard";
import { toBanglaDigits } from "@/lib/slug";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const session = await requireStaffSession();
  const rows = await db
    .select({
      article: articles,
      categoryName: categories.nameBn
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .orderBy(desc(articles.updatedAt));

  return (
    <AdminFrame description="Draft, review, publish and update Bangla sports stories." session={session} title="Articles">
      <div className="mb-5 flex justify-end">
        <Button asChild>
          <Link href="/admin/articles/new">
            <Plus className="h-4 w-4" />
            New article
          </Link>
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3">Headline</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Breaking</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ article, categoryName }) => (
              <tr className="border-t" key={article.id}>
                <td className="px-4 py-3">
                  <Link className="font-medium hover:text-primary" href={`/admin/articles/${article.id}/edit`}>
                    {article.headlineBn}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{categoryName ?? "-"}</td>
                <td className="px-4 py-3">{article.status}</td>
                <td className="px-4 py-3">{article.breaking}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {toBanglaDigits(article.updatedAt.toLocaleDateString("bn-BD"))}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>
                  No articles yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminFrame>
  );
}
