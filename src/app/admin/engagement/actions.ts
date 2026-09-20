"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { articleComments, pollOptions, polls } from "@/db/schema";
import { requireStaffSession } from "@/lib/auth-guard";
import { formBoolean, formDate, formString, nullableFormString } from "@/lib/form-data";

const commentStatusSchema = z.enum(["pending", "approved", "rejected", "spam"]);

export async function moderateCommentAction(commentId: string, status: string) {
  const session = await requireStaffSession(["admin", "editor"]);
  const nextStatus = commentStatusSchema.parse(status);

  await db
    .update(articleComments)
    .set({
      status: nextStatus,
      moderatedById: session.user.id,
      moderatedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(articleComments.id, commentId));

  revalidatePath("/admin/engagement");
  revalidatePath("/");
}

export async function deleteCommentAction(commentId: string) {
  await requireStaffSession(["admin", "editor"]);

  await db.delete(articleComments).where(eq(articleComments.id, commentId));

  revalidatePath("/admin/engagement");
}

export async function createPollAction(formData: FormData) {
  const session = await requireStaffSession(["admin", "editor"]);
  const questionBn = formString(formData, "questionBn");
  const optionLabels = formString(formData, "options")
    .split("\n")
    .map((option) => option.trim())
    .filter(Boolean);

  if (!questionBn) {
    throw new Error("Poll question is required.");
  }

  if (optionLabels.length < 2) {
    throw new Error("Add at least two poll options.");
  }

  const [poll] = await db
    .insert(polls)
    .values({
      articleId: nullableFormString(formData, "articleId"),
      questionBn,
      isActive: formBoolean(formData, "isActive"),
      startsAt: formDate(formData, "startsAt"),
      endsAt: formDate(formData, "endsAt"),
      createdById: session.user.id
    })
    .returning();

  if (!poll) {
    throw new Error("Poll could not be created.");
  }

  await db.insert(pollOptions).values(
    optionLabels.slice(0, 8).map((labelBn, index) => ({
      pollId: poll.id,
      labelBn,
      sortOrder: index
    }))
  );

  revalidatePath("/admin/engagement");
  redirect("/admin/engagement");
}

export async function togglePollAction(pollId: string, isActive: boolean) {
  await requireStaffSession(["admin", "editor"]);

  await db.update(polls).set({ isActive, updatedAt: new Date() }).where(eq(polls.id, pollId));

  revalidatePath("/admin/engagement");
  revalidatePath("/");
}

export async function deletePollAction(pollId: string) {
  await requireStaffSession(["admin", "editor"]);

  await db.delete(polls).where(eq(polls.id, pollId));

  revalidatePath("/admin/engagement");
  revalidatePath("/");
}
