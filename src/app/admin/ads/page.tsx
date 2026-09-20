import { desc } from "drizzle-orm";
import { createAdSlotAction, deleteAdSlotAction, toggleAdSlotAction, updateAdSlotAction } from "@/app/admin/ads/actions";
import { AdminFrame } from "@/components/admin/admin-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/db";
import { adSlots } from "@/db/schema";
import { requireStaffSession } from "@/lib/auth-guard";

const placements = [
  ["top_banner", "Top banner"],
  ["article_header", "Article header"],
  ["in_article", "In article"],
  ["sidebar", "Sidebar"],
  ["homepage_between_sections", "Homepage between sections"],
  ["sticky_mobile", "Sticky mobile banner"]
] as const;

export const dynamic = "force-dynamic";

export default async function AdsPage() {
  const session = await requireStaffSession(["admin", "ad_manager"]);
  const slots = await db.select().from(adSlots).orderBy(adSlots.placement, adSlots.sortOrder, desc(adSlots.updatedAt));

  return (
    <AdminFrame
      description="Configure ad-network snippets, direct-sold placements and sponsored inventory."
      session={session}
      title="Advertising"
    >
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-lg font-semibold">Create ad slot</h2>
          <p className="mt-1 text-sm text-muted-foreground">Scripts are rendered only from staff-managed slots.</p>
          <AdSlotForm action={createAdSlotAction} />
        </section>

        <section className="space-y-4">
          {slots.length > 0 ? (
            slots.map((slot) => (
              <article className="rounded-lg border bg-card p-5" key={slot.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{slot.label}</h2>
                      <span className="rounded bg-secondary px-2 py-1 text-xs font-medium">{slot.placement}</span>
                      {slot.isActive ? (
                        <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">Active</span>
                      ) : (
                        <span className="rounded bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-600">Paused</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Key: {slot.slotKey}
                      {slot.pageType ? ` | Page: ${slot.pageType}` : ""}
                      {slot.sectionSlug ? ` | Section: ${slot.sectionSlug}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={toggleAdSlotAction.bind(null, slot.id, !slot.isActive)}>
                      <Button className="h-9 px-3" type="submit" variant="outline">
                        {slot.isActive ? "Pause" : "Activate"}
                      </Button>
                    </form>
                    <form action={deleteAdSlotAction.bind(null, slot.id)}>
                      <Button className="h-9 bg-red-600 px-3 text-white hover:bg-red-700" type="submit">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
                <AdSlotForm action={updateAdSlotAction.bind(null, slot.id)} slot={slot} />
              </article>
            ))
          ) : (
            <div className="rounded-lg border border-dashed bg-card p-8 text-sm text-muted-foreground">
              No ad slots yet. Create common keys like home-top, article-header, article-sidebar, home-between-1 and sticky-mobile.
            </div>
          )}
        </section>
      </div>
    </AdminFrame>
  );
}

type AdSlot = typeof adSlots.$inferSelect;

function datetimeLocalValue(value: Date | null) {
  if (!value) {
    return "";
  }

  return new Date(value.getTime() - value.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function AdSlotForm({ action, slot }: { action: (formData: FormData) => void | Promise<void>; slot?: AdSlot }) {
  return (
    <form action={action} className="mt-4 grid gap-3">
      <Input defaultValue={slot?.slotKey ?? ""} name="slotKey" placeholder="slot key, e.g. home-top" required />
      <Input defaultValue={slot?.label ?? ""} name="label" placeholder="Display label" required />
      <select
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        defaultValue={slot?.placement ?? "top_banner"}
        name="placement"
      >
        {placements.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input defaultValue={slot?.pageType ?? ""} name="pageType" placeholder="Page type, e.g. article" />
        <Input defaultValue={slot?.sectionSlug ?? ""} name="sectionSlug" placeholder="Section slug target" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input defaultValue={slot?.sortOrder ?? 0} name="sortOrder" placeholder="Sort order" type="number" />
        <Input defaultValue={datetimeLocalValue(slot?.startsAt ?? null)} name="startsAt" type="datetime-local" />
        <Input defaultValue={datetimeLocalValue(slot?.endsAt ?? null)} name="endsAt" type="datetime-local" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input defaultChecked={slot?.isActive ?? false} name="isActive" type="checkbox" />
        Active
      </label>
      <textarea
        className="min-h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        defaultValue={slot?.html ?? ""}
        name="html"
        placeholder="<script async src=...></script>"
        required
      />
      <Button type="submit">{slot ? "Save ad slot" : "Create ad slot"}</Button>
    </form>
  );
}
