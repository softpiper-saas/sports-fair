import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { siteName, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const rows = await db
    .select({
      headlineBn: articles.headlineBn,
      slug: articles.slug,
      publishedAt: articles.publishedAt
    })
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(1000);
  const recent = rows.filter((row) => row.publishedAt && row.publishedAt >= twoDaysAgo);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recent.map((row) => newsUrl(row.slug, row.headlineBn, row.publishedAt ?? new Date())).join("\n")}
</urlset>`;

  return new NextResponse(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8"
    }
  });
}

function newsUrl(slug: string, title: string, publishedAt: Date) {
  return `  <url>
    <loc>${escapeXml(siteUrl(`/news/${slug}`))}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteName)}</news:name>
        <news:language>bn</news:language>
      </news:publication>
      <news:publication_date>${publishedAt.toISOString()}</news:publication_date>
      <news:title>${escapeXml(title)}</news:title>
    </news:news>
  </url>`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
