import { asc, desc } from "drizzle-orm";
import { createVideoAction } from "@/app/admin/cms-actions";
import { AdminFrame } from "@/components/admin/admin-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/db";
import { categories, mediaAssets, videos } from "@/db/schema";
import { requireStaffSession } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const session = await requireStaffSession(["admin", "editor", "journalist"]);
  const [rows, categoryRows, mediaRows] = await Promise.all([
    db.select().from(videos).orderBy(desc(videos.createdAt)),
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.nameBn)),
    db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt))
  ]);

  return (
    <AdminFrame description="Create standalone video items, not only embeds inside articles." session={session} title="Videos">
      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <form action={createVideoAction} className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="text-base font-semibold">New video</h2>
          <Input name="titleBn" placeholder="Bangla title" required />
          <Input name="titleEn" placeholder="English title optional" />
          <Input name="slug" placeholder="Bangla slug optional" />
          <Input name="videoUrl" placeholder="Video URL or embed URL" required />
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" name="categoryId">
            <option value="">No category</option>
            {categoryRows.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nameBn}
              </option>
            ))}
          </select>
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" name="thumbnailId">
            <option value="">No thumbnail</option>
            {mediaRows.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.altBn || asset.objectKey}
              </option>
            ))}
          </select>
          <Input name="publishedAt" type="datetime-local" />
          <textarea
            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            name="description"
            placeholder="Description"
          />
          <Button className="w-full" type="submit">
            Save video
          </Button>
        </form>

        <div className="space-y-3">
          {rows.map((video) => (
            <article className="rounded-lg border bg-card p-4" key={video.id}>
              <h2 className="font-semibold">{video.titleBn}</h2>
              <p className="break-all text-sm text-muted-foreground">{video.videoUrl}</p>
            </article>
          ))}
          {rows.length === 0 ? <p className="text-sm text-muted-foreground">No videos yet.</p> : null}
        </div>
      </div>
    </AdminFrame>
  );
}
