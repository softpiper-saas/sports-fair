import { and, asc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { db } from "@/db";
import { adSlots } from "@/db/schema";

export type AdTarget = {
  pageType?: string;
  sectionSlug?: string | null;
};

export async function getActiveAdSlot(slotKey: string, target: AdTarget = {}) {
  const now = new Date();
  const [slot] = await db
    .select()
    .from(adSlots)
    .where(
      and(
        eq(adSlots.slotKey, slotKey),
        eq(adSlots.isActive, true),
        or(isNull(adSlots.startsAt), lte(adSlots.startsAt, now)),
        or(isNull(adSlots.endsAt), gte(adSlots.endsAt, now)),
        or(isNull(adSlots.pageType), eq(adSlots.pageType, target.pageType ?? "")),
        or(isNull(adSlots.sectionSlug), eq(adSlots.sectionSlug, target.sectionSlug ?? ""))
      )
    )
    .orderBy(asc(adSlots.sortOrder), asc(adSlots.createdAt))
    .limit(1);

  return slot ?? null;
}

export async function getActiveAdSlotsByPlacement(
  placement: (typeof adSlots.$inferSelect)["placement"],
  target: AdTarget = {},
  limit = 3
) {
  const now = new Date();

  return db
    .select()
    .from(adSlots)
    .where(
      and(
        eq(adSlots.placement, placement),
        eq(adSlots.isActive, true),
        or(isNull(adSlots.startsAt), lte(adSlots.startsAt, now)),
        or(isNull(adSlots.endsAt), gte(adSlots.endsAt, now)),
        or(isNull(adSlots.pageType), eq(adSlots.pageType, target.pageType ?? "")),
        or(isNull(adSlots.sectionSlug), eq(adSlots.sectionSlug, target.sectionSlug ?? ""))
      )
    )
    .orderBy(asc(adSlots.sortOrder), asc(adSlots.createdAt))
    .limit(limit);
}
