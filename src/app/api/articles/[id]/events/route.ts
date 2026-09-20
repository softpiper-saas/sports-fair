import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { articleEngagementEvents, articles } from "@/db/schema";

const eventSchema = z.object({
  eventType: z.enum(["view", "share"]),
  path: z.string().max(500).optional(),
  referrer: z.string().max(500).optional()
});

type ArticleEventContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: ArticleEventContext) {
  const { id } = await context.params;
  const body = eventSchema.safeParse(await request.json().catch(() => null));

  if (!body.success) {
    return NextResponse.json({ error: "Invalid event payload." }, { status: 400 });
  }

  const [article] = await db.select({ id: articles.id }).from(articles).where(eq(articles.id, id)).limit(1);

  if (!article) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  await db.insert(articleEngagementEvents).values({
    articleId: id,
    eventType: body.data.eventType,
    path: body.data.path,
    referrer: body.data.referrer,
    userAgent: request.headers.get("user-agent")
  });

  return NextResponse.json({ ok: true });
}
