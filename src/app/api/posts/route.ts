import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { db } from "@/db";
import { posts } from "@/db/schema";

const createPostSchema = z.object({
  title: z.string().trim().min(3).max(120),
  content: z.string().trim().min(1).max(20_000)
});

export async function POST(request: Request) {
  const payload = createPostSchema.parse(await request.json());
  const sanitizedContent = sanitizeHtml(payload.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title"]
    }
  });

  const [post] = await db
    .insert(posts)
    .values({
      title: payload.title,
      content: sanitizedContent
    })
    .returning();

  return NextResponse.json({ post }, { status: 201 });
}
