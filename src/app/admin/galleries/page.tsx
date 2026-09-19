import { asc, desc } from "drizzle-orm";
import { createGalleryAction } from "@/app/admin/cms-actions";
import { AdminFrame } from "@/components/admin/admin-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/db";
import { categories, galleries, mediaAssets } from "@/db/schema";
import { requireStaffSession } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function GalleriesPage() {
  const session = await requireStaffSession(["admin", "editor", "journalist"]);
  const [rows, categoryRows, mediaRows] = await Promise.all([
    db.select().from(galleries).orderBy(desc(galleries.createdAt)),
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.nameBn)),
    db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt))
  ]);

  return (
    <AdminFrame description="Create photo galleries for match photos, training and fan moments." session={session} title="Galleries">
      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <form action={createGalleryAction} className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="text-base font-semibold">New gallery</h2>
          <Input name="titleBn" placeholder="Bangla title" required />
          <Input name="titleEn" placeholder="English title optional" />
          <Input name="slug" placeholder="Bangla slug optional" />
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" name="categoryId">
            <option value="">No category</option>
            {categoryRows.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nameBn}
              </option>
            ))}
          </select>
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" name="coverImageId">
            <option value="">No cover</option>
            {mediaRows.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.altBn || asset.objectKey}
              </option>
            ))}
          </select>
          <Input name="mediaIds" placeholder="Media IDs, comma separated" />
          <Input name="publishedAt" type="datetime-local" />
          <textarea
            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            name="description"
            placeholder="Description"
          />
          <Button className="w-full" type="submit">
            Save gallery
          </Button>
        </form>

        <div className="space-y-3">
          {rows.map((gallery) => (
            <article className="rounded-lg border bg-card p-4" key={gallery.id}>
              <h2 className="font-semibold">{gallery.titleBn}</h2>
              <p className="text-sm text-muted-foreground">{gallery.description}</p>
            </article>
          ))}
          {rows.length === 0 ? <p className="text-sm text-muted-foreground">No galleries yet.</p> : null}
        </div>
      </div>
    </AdminFrame>
  );
}
