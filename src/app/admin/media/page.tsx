import { desc } from "drizzle-orm";
import { createMediaAssetAction } from "@/app/admin/cms-actions";
import { AdminFrame } from "@/components/admin/admin-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { requireStaffSession } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const session = await requireStaffSession(["admin", "editor", "journalist"]);
  const rows = await db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt));

  return (
    <AdminFrame description="Register Cloudflare R2 media assets for use in stories, videos and galleries." session={session} title="Media">
      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <form action={createMediaAssetAction} className="space-y-3 rounded-lg border bg-card p-4" encType="multipart/form-data">
          <h2 className="text-base font-semibold">Add media asset</h2>
          <Input name="file" type="file" />
          <Input name="objectKey" placeholder="R2 object key optional" />
          <Input name="publicUrl" placeholder="Public URL for already-uploaded asset" />
          <Input defaultValue="image/jpeg" name="mimeType" placeholder="MIME type" />
          <Input name="sizeBytes" placeholder="Size in bytes optional" type="number" />
          <Input name="altBn" placeholder="Bangla alt text" />
          <Input name="captionBn" placeholder="Bangla caption" />
          <Input name="credit" placeholder="Credit" />
          <Button className="w-full" type="submit">
            Save media
          </Button>
        </form>

        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((asset) => (
            <article className="overflow-hidden rounded-lg border bg-card" key={asset.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={asset.altBn ?? ""} className="aspect-video w-full object-cover" src={asset.publicUrl} />
              <div className="space-y-1 p-4">
                <h2 className="font-medium">{asset.altBn || asset.objectKey}</h2>
                <p className="break-all text-xs text-muted-foreground">{asset.publicUrl}</p>
                <p className="text-xs text-muted-foreground">ID: {asset.id}</p>
              </div>
            </article>
          ))}
          {rows.length === 0 ? <p className="text-sm text-muted-foreground">No media assets yet.</p> : null}
        </div>
      </div>
    </AdminFrame>
  );
}
