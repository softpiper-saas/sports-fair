"use server";

import crypto from "node:crypto";
import { and, eq, gte, isNull, lte, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { db } from "@/db";
import { articleComments, articles, pollOptions, polls, pollVotes } from "@/db/schema";

const commentSchema = z.object({
  authorName: z.string().trim().min(2).max(80),
  authorEmail: z.string().trim().email().max(160).optional().or(z.literal("")),
  body: z.string().trim().min(3).max(1200)
});

function cleanText(value: string) {
  return sanitizeHtml(value, { allowedAttributes: {}, allowedTags: [] }).trim();
}

async function getClientMeta() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for") ?? "";
  const userAgent = headerStore.get("user-agent") ?? "";
  const ip = forwardedFor.split(",")[0]?.trim() || headerStore.get("x-real-ip") || "unknown";
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

  return { ipHash, userAgent };
}

async function getOrCreateVoterKey() {
  const cookieStore = await cookies();
  const existing = cookieStore.get("sportsfair_voter")?.value;

  if (existing) {
    return existing;
  }

  const value = crypto.randomUUID();
  cookieStore.set("sportsfair_voter", value, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return value;
}

export async function submitCommentAction(articleId: string, slug: string, formData: FormData) {
  const parsed = commentSchema.safeParse({
    authorName: formData.get("authorName"),
    authorEmail: formData.get("authorEmail"),
    body: formData.get("body")
  });

  if (!parsed.success) {
    throw new Error("নাম এবং মন্তব্য ঠিকভাবে লিখুন।");
  }

  const [article] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(and(eq(articles.id, articleId), eq(articles.status, "published")))
    .limit(1);

  if (!article) {
    throw new Error("Article is not available for comments.");
  }

  const { ipHash, userAgent } = await getClientMeta();

  await db.insert(articleComments).values({
    articleId,
    authorName: cleanText(parsed.data.authorName),
    authorEmail: parsed.data.authorEmail ? parsed.data.authorEmail : null,
    body: cleanText(parsed.data.body),
    ipHash,
    userAgent
  });

  revalidatePath(`/news/${slug}`);
}

export async function votePollAction(articleId: string, slug: string, formData: FormData) {
  const optionId = z.string().uuid().parse(formData.get("optionId"));
  const voterKey = await getOrCreateVoterKey();
  const now = new Date();

  const [option] = await db
    .select({ optionId: pollOptions.id, pollId: polls.id })
    .from(pollOptions)
    .innerJoin(polls, eq(pollOptions.pollId, polls.id))
    .where(
      and(
        eq(pollOptions.id, optionId),
        eq(polls.articleId, articleId),
        eq(polls.isActive, true),
        or(isNull(polls.startsAt), lte(polls.startsAt, now)),
        or(isNull(polls.endsAt), gte(polls.endsAt, now))
      )
    )
    .limit(1);

  if (!option) {
    throw new Error("Poll option is not available.");
  }

  await db
    .insert(pollVotes)
    .values({
      pollId: option.pollId,
      optionId: option.optionId,
      voterKey
    })
    .onConflictDoUpdate({
      target: [pollVotes.pollId, pollVotes.voterKey],
      set: { optionId: option.optionId, updatedAt: new Date() }
    });

  revalidatePath(`/news/${slug}`);
}
