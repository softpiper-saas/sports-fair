import { desc, eq } from "drizzle-orm";
import {
  createPollAction,
  deleteCommentAction,
  deletePollAction,
  moderateCommentAction,
  togglePollAction
} from "@/app/admin/engagement/actions";
import { AdminFrame } from "@/components/admin/admin-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/db";
import { articleComments, articles, polls } from "@/db/schema";
import { requireStaffSession } from "@/lib/auth-guard";
import { formatBanglaDate } from "@/lib/public/content";

export const dynamic = "force-dynamic";

export default async function EngagementAdminPage() {
  const session = await requireStaffSession(["admin", "editor"]);
  const [publishedArticles, comments, pollRows] = await Promise.all([
    db
      .select({ id: articles.id, headlineBn: articles.headlineBn })
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.publishedAt), desc(articles.updatedAt))
      .limit(80),
    db
      .select({
        comment: articleComments,
        articleTitle: articles.headlineBn,
        articleSlug: articles.slug
      })
      .from(articleComments)
      .innerJoin(articles, eq(articleComments.articleId, articles.id))
      .orderBy(articleComments.status, desc(articleComments.createdAt))
      .limit(60),
    db
      .select({
        poll: polls,
        articleTitle: articles.headlineBn
      })
      .from(polls)
      .leftJoin(articles, eq(polls.articleId, articles.id))
      .orderBy(desc(polls.createdAt))
      .limit(40)
  ]);

  return (
    <AdminFrame
      description="Moderate reader comments and create article polls."
      session={session}
      title="Engagement"
    >
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-lg font-semibold">Create poll</h2>
          <form action={createPollAction} className="mt-4 grid gap-3">
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" name="articleId">
              <option value="">Site-wide or later placement</option>
              {publishedArticles.map((article) => (
                <option key={article.id} value={article.id}>
                  {article.headlineBn}
                </option>
              ))}
            </select>
            <Input name="questionBn" placeholder="Bangla poll question" required />
            <textarea
              className="min-h-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              name="options"
              placeholder={"হ্যাঁ\nনা"}
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="startsAt" type="datetime-local" />
              <Input name="endsAt" type="datetime-local" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input defaultChecked name="isActive" type="checkbox" />
              Active
            </label>
            <Button type="submit">Create poll</Button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">Comment moderation</h2>
            <div className="mt-4 divide-y">
              {comments.length > 0 ? (
                comments.map(({ articleSlug, articleTitle, comment }) => (
                  <article className="py-4" key={comment.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{comment.authorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {comment.status} | {formatBanglaDate(comment.createdAt)} | {articleTitle}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <form action={moderateCommentAction.bind(null, comment.id, "approved")}>
                          <Button className="h-9 px-3" type="submit" variant="outline">
                            Approve
                          </Button>
                        </form>
                        <form action={moderateCommentAction.bind(null, comment.id, "rejected")}>
                          <Button className="h-9 px-3" type="submit" variant="outline">
                            Reject
                          </Button>
                        </form>
                        <form action={moderateCommentAction.bind(null, comment.id, "spam")}>
                          <Button className="h-9 px-3" type="submit" variant="outline">
                            Spam
                          </Button>
                        </form>
                        <form action={deleteCommentAction.bind(null, comment.id)}>
                          <Button className="h-9 bg-red-600 px-3 text-white hover:bg-red-700" type="submit">
                            Delete
                          </Button>
                        </form>
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap rounded-md bg-secondary p-3 text-sm leading-6">{comment.body}</p>
                    <a className="mt-2 inline-flex text-xs font-medium text-primary" href={`/news/${encodeURIComponent(articleSlug)}`}>
                      View article
                    </a>
                  </article>
                ))
              ) : (
                <p className="py-6 text-sm text-muted-foreground">No comments yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">Polls</h2>
            <div className="mt-4 divide-y">
              {pollRows.length > 0 ? (
                pollRows.map(({ articleTitle, poll }) => (
                  <article className="flex flex-wrap items-start justify-between gap-3 py-4" key={poll.id}>
                    <div>
                      <p className="font-semibold">{poll.questionBn}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {poll.isActive ? "active" : "paused"} | {articleTitle || "site-wide/later"} | {formatBanglaDate(poll.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <form action={togglePollAction.bind(null, poll.id, !poll.isActive)}>
                        <Button className="h-9 px-3" type="submit" variant="outline">
                          {poll.isActive ? "Pause" : "Activate"}
                        </Button>
                      </form>
                      <form action={deletePollAction.bind(null, poll.id)}>
                        <Button className="h-9 bg-red-600 px-3 text-white hover:bg-red-700" type="submit">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </article>
                ))
              ) : (
                <p className="py-6 text-sm text-muted-foreground">No polls yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </AdminFrame>
  );
}
