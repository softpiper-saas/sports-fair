import { and, desc, eq, isNotNull, ne } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories, galleries, galleryImages, mediaAssets, user, videos } from "@/db/schema";

export type PublicArticle = Awaited<ReturnType<typeof getPublishedArticles>>[number];

const publishedArticleWhere = eq(articles.status, "published");

export function formatBanglaDate(value: Date | null) {
  if (!value) {
    return "অপ্রকাশিত";
  }

  return new Intl.DateTimeFormat("bn-BD", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka"
  }).format(value);
}

export async function getNavigationCategories() {
  return db
    .select({
      id: categories.id,
      nameBn: categories.nameBn,
      slug: categories.slug
    })
    .from(categories)
    .orderBy(categories.sortOrder, categories.nameBn)
    .limit(8);
}

export async function getPublishedArticles(limit = 20) {
  return db
    .select({
      id: articles.id,
      headlineBn: articles.headlineBn,
      slug: articles.slug,
      summary: articles.summary,
      breaking: articles.breaking,
      featured: articles.featured,
      publishedAt: articles.publishedAt,
      updatedAt: articles.updatedAt,
      categoryName: categories.nameBn,
      categorySlug: categories.slug,
      imageUrl: mediaAssets.publicUrl,
      imageAlt: mediaAssets.altBn,
      imageCaption: mediaAssets.captionBn,
      authorName: user.name
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(mediaAssets, eq(articles.heroImageId, mediaAssets.id))
    .leftJoin(user, eq(articles.authorId, user.id))
    .where(publishedArticleWhere)
    .orderBy(desc(articles.publishedAt), desc(articles.updatedAt))
    .limit(limit);
}

export async function getFeaturedArticles(limit = 6) {
  return db
    .select({
      id: articles.id,
      headlineBn: articles.headlineBn,
      slug: articles.slug,
      summary: articles.summary,
      breaking: articles.breaking,
      featured: articles.featured,
      publishedAt: articles.publishedAt,
      updatedAt: articles.updatedAt,
      categoryName: categories.nameBn,
      categorySlug: categories.slug,
      imageUrl: mediaAssets.publicUrl,
      imageAlt: mediaAssets.altBn,
      imageCaption: mediaAssets.captionBn,
      authorName: user.name
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(mediaAssets, eq(articles.heroImageId, mediaAssets.id))
    .leftJoin(user, eq(articles.authorId, user.id))
    .where(and(publishedArticleWhere, eq(articles.featured, true)))
    .orderBy(desc(articles.publishedAt), desc(articles.updatedAt))
    .limit(limit);
}

export async function getBreakingArticles(limit = 5) {
  return db
    .select({
      id: articles.id,
      headlineBn: articles.headlineBn,
      slug: articles.slug,
      breaking: articles.breaking,
      publishedAt: articles.publishedAt
    })
    .from(articles)
    .where(and(publishedArticleWhere, ne(articles.breaking, "normal")))
    .orderBy(desc(articles.publishedAt), desc(articles.updatedAt))
    .limit(limit);
}

export async function getArticlesByCategorySlug(slug: string, limit = 24) {
  const [category] = await db
    .select({
      id: categories.id,
      nameBn: categories.nameBn,
      description: categories.description,
      slug: categories.slug
    })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (!category) {
    return { category: null, articles: [] };
  }

  const rows = await db
    .select({
      id: articles.id,
      headlineBn: articles.headlineBn,
      slug: articles.slug,
      summary: articles.summary,
      breaking: articles.breaking,
      featured: articles.featured,
      publishedAt: articles.publishedAt,
      updatedAt: articles.updatedAt,
      categoryName: categories.nameBn,
      categorySlug: categories.slug,
      imageUrl: mediaAssets.publicUrl,
      imageAlt: mediaAssets.altBn,
      imageCaption: mediaAssets.captionBn,
      authorName: user.name
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(mediaAssets, eq(articles.heroImageId, mediaAssets.id))
    .leftJoin(user, eq(articles.authorId, user.id))
    .where(and(publishedArticleWhere, eq(articles.categoryId, category.id)))
    .orderBy(desc(articles.publishedAt), desc(articles.updatedAt))
    .limit(limit);

  return { category, articles: rows };
}

export async function getArticleBySlug(slug: string) {
  const [article] = await db
    .select({
      id: articles.id,
      headlineBn: articles.headlineBn,
      headlineEn: articles.headlineEn,
      slug: articles.slug,
      summary: articles.summary,
      bodyHtml: articles.bodyHtml,
      breaking: articles.breaking,
      publishedAt: articles.publishedAt,
      contentUpdatedAt: articles.contentUpdatedAt,
      seoTitle: articles.seoTitle,
      seoDescription: articles.seoDescription,
      canonicalUrl: articles.canonicalUrl,
      categoryName: categories.nameBn,
      categorySlug: categories.slug,
      imageUrl: mediaAssets.publicUrl,
      imageAlt: mediaAssets.altBn,
      imageCaption: mediaAssets.captionBn,
      imageCredit: mediaAssets.credit,
      authorName: user.name
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(mediaAssets, eq(articles.heroImageId, mediaAssets.id))
    .leftJoin(user, eq(articles.authorId, user.id))
    .where(and(publishedArticleWhere, eq(articles.slug, slug)))
    .limit(1);

  return article ?? null;
}

export async function getPublishedVideos(limit = 12) {
  return db
    .select({
      id: videos.id,
      titleBn: videos.titleBn,
      slug: videos.slug,
      description: videos.description,
      videoUrl: videos.videoUrl,
      publishedAt: videos.publishedAt,
      thumbnailUrl: mediaAssets.publicUrl,
      thumbnailAlt: mediaAssets.altBn,
      categoryName: categories.nameBn,
      categorySlug: categories.slug
    })
    .from(videos)
    .leftJoin(mediaAssets, eq(videos.thumbnailId, mediaAssets.id))
    .leftJoin(categories, eq(videos.categoryId, categories.id))
    .where(isNotNull(videos.publishedAt))
    .orderBy(desc(videos.publishedAt), desc(videos.updatedAt))
    .limit(limit);
}

export async function getPublishedGalleries(limit = 12) {
  return db
    .select({
      id: galleries.id,
      titleBn: galleries.titleBn,
      slug: galleries.slug,
      description: galleries.description,
      publishedAt: galleries.publishedAt,
      coverUrl: mediaAssets.publicUrl,
      coverAlt: mediaAssets.altBn,
      categoryName: categories.nameBn,
      categorySlug: categories.slug
    })
    .from(galleries)
    .leftJoin(mediaAssets, eq(galleries.coverImageId, mediaAssets.id))
    .leftJoin(categories, eq(galleries.categoryId, categories.id))
    .where(isNotNull(galleries.publishedAt))
    .orderBy(desc(galleries.publishedAt), desc(galleries.updatedAt))
    .limit(limit);
}

export async function getGalleryImages(galleryId: string) {
  return db
    .select({
      id: galleryImages.id,
      captionBn: galleryImages.captionBn,
      imageUrl: mediaAssets.publicUrl,
      imageAlt: mediaAssets.altBn,
      credit: mediaAssets.credit
    })
    .from(galleryImages)
    .innerJoin(mediaAssets, eq(galleryImages.mediaAssetId, mediaAssets.id))
    .where(eq(galleryImages.galleryId, galleryId))
    .orderBy(galleryImages.sortOrder, galleryImages.createdAt);
}
