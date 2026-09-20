import { desc, eq } from "drizzle-orm";
import { AdminFrame } from "@/components/admin/admin-frame";
import {
  createHomepageSlotAction,
  deleteHomepageSlotAction,
  updateHomepageSlotAction
} from "@/app/admin/cms-actions";
import { db } from "@/db";
import { articles, homepageSlots } from "@/db/schema";
import { requireStaffSession } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

const slotOptions = [
  ["lead", "Lead story"],
  ["secondary", "Story 2 / Story 3"],
  ["editor_pick", "Editor pick"],
  ["cricket", "Homepage cricket"],
  ["football", "Homepage football"],
  ["video", "Video highlight"]
] as const;

export default async function AdminHomepagePage() {
  const session = await requireStaffSession(["admin", "editor"]);
  const [publishedArticles, slots] = await Promise.all([
    db
      .select({
        id: articles.id,
        headlineBn: articles.headlineBn,
        slug: articles.slug,
        publishedAt: articles.publishedAt
      })
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.publishedAt), desc(articles.updatedAt))
      .limit(100),
    db
      .select({
        id: homepageSlots.id,
        slotType: homepageSlots.slotType,
        label: homepageSlots.label,
        sortOrder: homepageSlots.sortOrder,
        startsAt: homepageSlots.startsAt,
        endsAt: homepageSlots.endsAt,
        articleId: homepageSlots.articleId,
        headlineBn: articles.headlineBn
      })
      .from(homepageSlots)
      .leftJoin(articles, eq(homepageSlots.articleId, articles.id))
      .orderBy(homepageSlots.slotType, homepageSlots.sortOrder, desc(homepageSlots.updatedAt))
  ]);

  return (
    <AdminFrame
      description="Control the reader-facing homepage without changing article metadata."
      session={session}
      title="Homepage control"
    >
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-lg font-semibold">Add homepage slot</h2>
          <p className="mt-1 text-sm text-muted-foreground">Only published articles can appear on the public homepage.</p>
          <HomepageSlotForm action={createHomepageSlotAction} articles={publishedArticles} />
        </section>

        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-lg font-semibold">Active slot list</h2>
          <div className="mt-4 grid gap-4">
            {slots.length > 0 ? (
              slots.map((slot) => (
                <div className="rounded-md border p-4" key={slot.id}>
                  <p className="text-xs font-semibold uppercase text-primary">{slot.slotType}</p>
                  <h3 className="mt-1 font-semibold">{slot.headlineBn ?? "No article selected"}</h3>
                  <HomepageSlotForm
                    action={updateHomepageSlotAction.bind(null, slot.id)}
                    articles={publishedArticles}
                    defaults={slot}
                  />
                  <form action={deleteHomepageSlotAction.bind(null, slot.id)} className="mt-3">
                    <button className="rounded-md border border-destructive px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground">
                      Remove slot
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">
                No homepage slots yet. The public homepage will keep using latest/featured fallbacks.
              </p>
            )}
          </div>
        </section>
      </div>
    </AdminFrame>
  );
}

function HomepageSlotForm({
  action,
  articles,
  defaults
}: {
  action: (formData: FormData) => void | Promise<void>;
  articles: { id: string; headlineBn: string }[];
  defaults?: {
    slotType: string;
    label: string | null;
    sortOrder: number;
    startsAt: Date | null;
    endsAt: Date | null;
    articleId: string | null;
  };
}) {
  return (
    <form action={action} className="mt-4 grid gap-3">
      <label className="grid gap-1 text-sm font-medium">
        Slot type
        <select className="rounded-md border bg-background px-3 py-2" name="slotType" defaultValue={defaults?.slotType ?? "secondary"}>
          {slotOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Article
        <select className="rounded-md border bg-background px-3 py-2" name="articleId" defaultValue={defaults?.articleId ?? ""} required>
          <option value="">Select published article</option>
          {articles.map((article) => (
            <option key={article.id} value={article.id}>
              {article.headlineBn}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          Label
          <input className="rounded-md border bg-background px-3 py-2" name="label" defaultValue={defaults?.label ?? ""} />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Sort order
          <input className="rounded-md border bg-background px-3 py-2" name="sortOrder" type="number" defaultValue={defaults?.sortOrder ?? 0} />
        </label>
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
        Save slot
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
