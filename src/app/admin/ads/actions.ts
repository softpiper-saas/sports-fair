"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { adSlots } from "@/db/schema";
import { requireStaffSession } from "@/lib/auth-guard";
import { formBoolean, formDate, formInteger, formString, nullableFormString } from "@/lib/form-data";

const placementSchema = z.enum([
  "top_banner",
  "article_header",
  "in_article",
  "sidebar",
  "homepage_between_sections",
  "sticky_mobile"
]);

const slotKeySchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9][a-z0-9-_.]*[a-z0-9]$/i, "Use letters, numbers, dashes, underscores or dots.");

function parseAdSlot(formData: FormData) {
  const label = formString(formData, "label");
  const html = formString(formData, "html");

  if (!label) {
    throw new Error("Ad label is required.");
  }

  if (!html) {
    throw new Error("Ad HTML/script is required.");
  }

  return {
    slotKey: slotKeySchema.parse(formString(formData, "slotKey")),
    label,
    placement: placementSchema.parse(formString(formData, "placement")),
    html,
    isActive: formBoolean(formData, "isActive"),
    pageType: nullableFormString(formData, "pageType"),
    sectionSlug: nullableFormString(formData, "sectionSlug"),
    sortOrder: formInteger(formData, "sortOrder") ?? 0,
    startsAt: formDate(formData, "startsAt"),
    endsAt: formDate(formData, "endsAt")
  };
}

export async function createAdSlotAction(formData: FormData) {
  const session = await requireStaffSession(["admin", "ad_manager"]);

  await db.insert(adSlots).values({
    ...parseAdSlot(formData),
    createdById: session.user.id
  });

  revalidatePath("/");
  revalidatePath("/admin/ads");
  redirect("/admin/ads");
}

export async function updateAdSlotAction(id: string, formData: FormData) {
  await requireStaffSession(["admin", "ad_manager"]);

  await db
    .update(adSlots)
    .set({
      ...parseAdSlot(formData),
      updatedAt: new Date()
    })
    .where(eq(adSlots.id, id));

  revalidatePath("/");
  revalidatePath("/admin/ads");
  redirect("/admin/ads");
}

export async function toggleAdSlotAction(id: string, isActive: boolean) {
  await requireStaffSession(["admin", "ad_manager"]);

  await db
    .update(adSlots)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(adSlots.id, id));

  revalidatePath("/");
  revalidatePath("/admin/ads");
}

export async function deleteAdSlotAction(id: string) {
  await requireStaffSession(["admin", "ad_manager"]);

  await db.delete(adSlots).where(eq(adSlots.id, id));

  revalidatePath("/");
  revalidatePath("/admin/ads");
}
