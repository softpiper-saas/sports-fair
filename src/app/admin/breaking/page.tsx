import { desc, eq } from "drizzle-orm";
import { AdminFrame } from "@/components/admin/admin-frame";
import {
  createBreakingNewsAction,
  deleteBreakingNewsAction,
  updateBreakingNewsAction
} from "@/app/admin/cms-actions";
import { db } from "@/db";
import { articles, breakingNews } from "@/db/schema";
import { requireStaffSession } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function AdminBreakingPage() {
  const session = await requireStaffSession(["admin", "editor"]);
  const [publishedArticles, items] = await Promise.all([
    db
      .select({
        id: articles.id,
        headlineBn: articles.headlineBn
      })
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.publishedAt), desc(articles.updatedAt))
      .limit(100),
    db
      .select({
        id: breakingNews.id,
        titleBn: breakingNews.titleBn,
        summary: breakingNews.summary,
        articleId: breakingNews.articleId,
        priority: breakingNews.priority,
        isActive: breakingNews.isActive,
        isDeveloping: breakingNews.isDeveloping,
        startsAt: breakingNews.startsAt,
        endsAt: breakingNews.endsAt,
        createdAt: breakingNews.createdAt,
        linkedHeadline: articles.headlineBn
      })
      .from(breakingNews)
      .leftJoin(articles, eq(breakingNews.articleId, articles.id))
      .orderBy(desc(breakingNews.isActive), desc(breakingNews.priority), desc(breakingNews.createdAt))
  ]);

  return (
    <AdminFrame
      description="Publish direct breaking banners independent from article workflow."
      session={session}
      title="Breaking news"
    >
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-lg font-semibold">Create breaking item</h2>
          <BreakingForm action={createBreakingNewsAction} articles={publishedArticles} />
        </section>

        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-lg font-semibold">Breaking queue</h2>
          <div className="mt-4 grid gap-4">
            {items.length > 0 ? (
              items.map((item) => (
                <div className="rounded-md border p-4" key={item.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded px-2 py-1 text-xs font-bold ${item.isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                    {item.isDeveloping ? <span className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-700">Developing</span> : null}
                    <span className="text-xs font-medium text-muted-foreground">Priority {item.priority}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{item.titleBn}</h3>
                  {item.summary ? <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p> : null}
                  {item.linkedHeadline ? <p className="mt-2 text-xs text-muted-foreground">Linked: {item.linkedHeadline}</p> : null}
                  <BreakingForm
                    action={updateBreakingNewsAction.bind(null, item.id)}
                    articles={publishedArticles}
                    defaults={item}
                  />
                  <form action={deleteBreakingNewsAction.bind(null, item.id)} className="mt-3">
                    <button className="rounded-md border border-destructive px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground">
                      Delete breaking item
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">No breaking items yet.</p>
            )}
          </div>
        </section>
      </div>
    </AdminFrame>
  );
}

function BreakingForm({
  action,
  articles,
  defaults
}: {
  action: (formData: FormData) => void | Promise<void>;
  articles: { id: string; headlineBn: string }[];
  defaults?: {
    titleBn: string;
    summary: string | null;
    articleId: string | null;
    priority: number;
    isActive: boolean;
    isDeveloping: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
  };
}) {
  return (
    <form action={action} className="mt-4 grid gap-3">
      <label className="grid gap-1 text-sm font-medium">
        Bangla title
        <input className="rounded-md border bg-background px-3 py-2" name="titleBn" defaultValue={defaults?.titleBn ?? ""} required />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Summary
        <textarea className="min-h-20 rounded-md border bg-background px-3 py-2" name="summary" defaultValue={defaults?.summary ?? ""} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Linked article
        <select className="rounded-md border bg-background px-3 py-2" name="articleId" defaultValue={defaults?.articleId ?? ""}>
          <option value="">Plain text only</option>
          {articles.map((article) => (
            <option key={article.id} value={article.id}>
              {article.headlineBn}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          Priority
          <input className="rounded-md border bg-background px-3 py-2" name="priority" type="number" defaultValue={defaults?.priority ?? 0} />
        </label>
        <div className="grid content-end gap-2 text-sm font-medium">
          <label className="flex items-center gap-2">
            <input name="isActive" type="checkbox" defaultChecked={defaults?.isActive ?? true} />
            Active
          </label>
          <label className="flex items-center gap-2">
            <input name="isDeveloping" type="checkbox" defaultChecked={defaults?.isDeveloping ?? false} />
            Developing story
          </label>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          Starts at
          <input className="rounded-md border bg-background px-3 py-2" name="startsAt" type="datetime-local" defaultValue={toDateTimeLocal(defaults?.startsAt)} />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Ends at
          <input className="rounded-md border bg-background px-3 py-2" name="endsAt" type="datetime-local" defaultValue={toDateTimeLocal(defaults?.endsAt)} />
        </label>
      </div>
      <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
        Save breaking item
      </button>
    </form>
  );
}

function toDateTimeLocal(value: Date | null | undefined) {
  if (!value) {
    return "";
  }

  return new Date(value.getTime() - value.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
