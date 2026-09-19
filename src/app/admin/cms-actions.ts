"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { db } from "@/db";
import {
  articleTags,
  articles,
  categories,
  galleries,
  galleryImages,
  mediaAssets,
  tags,
  videos
} from "@/db/schema";
import { formBoolean, formDate, formInteger, formString, nullableFormString } from "@/lib/form-data";
import { requireStaffSession } from "@/lib/auth-guard";
import { r2Bucket, uploadToR2 } from "@/lib/r2";
import { ensureSlug } from "@/lib/slug";

const articleStatusSchema = z.enum(["draft", "review", "scheduled", "published", "archived"]);
const breakingStatusSchema = z.enum(["normal", "breaking", "major_breaking", "developing"]);

function sanitizeBody(value: string) {
  return sanitizeHtml(value, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "h3", "img", "figure", "figcaption"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title", "width", "height"],
      a: ["href", "name", "target", "rel"]
    }
  });
}

function parseBodyJson(value: string) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

async function syncArticleTags(articleId: string, tagNames: string[]) {
  await db.delete(articleTags).where(eq(articleTags.articleId, articleId));

  for (const name of tagNames) {
    const nameBn = name.trim();

    if (!nameBn) {
      continue;
    }

    const slug = ensureSlug(null, nameBn);
    const [tag] = await db
      .insert(tags)
      .values({ nameBn, slug })
      .onConflictDoUpdate({
        target: tags.slug,
        set: { nameBn, updatedAt: new Date() }
      })
      .returning();

    if (tag) {
      await db
        .insert(articleTags)
        .values({ articleId, tagId: tag.id })
        .onConflictDoNothing();
    }
  }
}

export async function createCategoryAction(formData: FormData) {
  await requireStaffSession(["admin", "editor", "journalist"]);

  const nameBn = formString(formData, "nameBn");
  const slug = ensureSlug(formString(formData, "slug"), nameBn);

  if (!nameBn) {
    throw new Error("Bangla category name is required.");
  }

  await db.insert(categories).values({
    nameBn,
    nameEn: nullableFormString(formData, "nameEn"),
    slug,
    description: nullableFormString(formData, "description"),
    sortOrder: formInteger(formData, "sortOrder") ?? 0
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function createMediaAssetAction(formData: FormData) {
  const session = await requireStaffSession(["admin", "editor", "journalist"]);
  const file = formData.get("file");
  let publicUrl = formString(formData, "publicUrl");
  let objectKey = formString(formData, "objectKey");
  let mimeType = formString(formData, "mimeType") || "image/jpeg";
  let sizeBytes = formInteger(formData, "sizeBytes");

  if (file instanceof File && file.size > 0) {
    objectKey = objectKey || `media/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]+/g, "-")}`;
    mimeType = file.type || mimeType;
    sizeBytes = file.size;
    publicUrl = await uploadToR2({
      body: Buffer.from(await file.arrayBuffer()),
      contentType: mimeType,
      key: objectKey
    });
  }

  if (!publicUrl || !objectKey) {
    throw new Error("Upload a file or provide both public URL and object key.");
  }

  await db.insert(mediaAssets).values({
    bucket: formString(formData, "bucket") || r2Bucket,
    objectKey,
    publicUrl,
    mimeType,
    sizeBytes,
    altBn: nullableFormString(formData, "altBn"),
    captionBn: nullableFormString(formData, "captionBn"),
    credit: nullableFormString(formData, "credit"),
    createdById: session.user.id
  });

  revalidatePath("/admin/media");
  redirect("/admin/media");
}

export async function createArticleAction(formData: FormData) {
  const session = await requireStaffSession(["admin", "editor", "journalist"]);

  const headlineBn = formString(formData, "headlineBn");
  const status = articleStatusSchema.parse(formString(formData, "status") || "draft");
  const breaking = breakingStatusSchema.parse(formString(formData, "breaking") || "normal");
  const bodyHtml = sanitizeBody(formString(formData, "bodyHtml"));
  const bodyJson = parseBodyJson(formString(formData, "bodyJson"));

  if (!headlineBn) {
    throw new Error("Bangla headline is required.");
  }

  const [article] = await db
    .insert(articles)
    .values({
      headlineBn,
      headlineEn: nullableFormString(formData, "headlineEn"),
      slug: ensureSlug(formString(formData, "slug"), headlineBn),
      summary: nullableFormString(formData, "summary"),
      bodyJson,
      bodyHtml,
      status,
      breaking,
      featured: formBoolean(formData, "featured"),
      heroImageId: nullableFormString(formData, "heroImageId"),
      authorId: session.user.id,
      categoryId: nullableFormString(formData, "categoryId"),
      seoTitle: nullableFormString(formData, "seoTitle"),
      seoDescription: nullableFormString(formData, "seoDescription"),
      canonicalUrl: nullableFormString(formData, "canonicalUrl"),
      publishedAt: formDate(formData, "publishedAt"),
      contentUpdatedAt: new Date()
    })
    .returning();

  if (!article) {
    throw new Error("Article could not be created.");
  }

  const tagNames = formString(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  await syncArticleTags(article.id, tagNames);

  revalidatePath("/admin/articles");
  redirect(`/admin/articles/${article.id}/edit`);
}

export async function updateArticleAction(articleId: string, formData: FormData) {
  await requireStaffSession(["admin", "editor", "journalist"]);

  const headlineBn = formString(formData, "headlineBn");
  const status = articleStatusSchema.parse(formString(formData, "status") || "draft");
  const breaking = breakingStatusSchema.parse(formString(formData, "breaking") || "normal");
  const bodyHtml = sanitizeBody(formString(formData, "bodyHtml"));
  const bodyJson = parseBodyJson(formString(formData, "bodyJson"));

  if (!headlineBn) {
    throw new Error("Bangla headline is required.");
  }

  await db
    .update(articles)
    .set({
      headlineBn,
      headlineEn: nullableFormString(formData, "headlineEn"),
      slug: ensureSlug(formString(formData, "slug"), headlineBn),
      summary: nullableFormString(formData, "summary"),
      bodyJson,
      bodyHtml,
      status,
      breaking,
      featured: formBoolean(formData, "featured"),
      heroImageId: nullableFormString(formData, "heroImageId"),
      categoryId: nullableFormString(formData, "categoryId"),
      seoTitle: nullableFormString(formData, "seoTitle"),
      seoDescription: nullableFormString(formData, "seoDescription"),
      canonicalUrl: nullableFormString(formData, "canonicalUrl"),
      publishedAt: formDate(formData, "publishedAt"),
      contentUpdatedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(articles.id, articleId));

  const tagNames = formString(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  await syncArticleTags(articleId, tagNames);

  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${articleId}/edit`);
  redirect("/admin/articles");
}

export async function createVideoAction(formData: FormData) {
  const session = await requireStaffSession(["admin", "editor", "journalist"]);
  const titleBn = formString(formData, "titleBn");

  if (!titleBn) {
    throw new Error("Bangla video title is required.");
  }

  await db.insert(videos).values({
    titleBn,
    titleEn: nullableFormString(formData, "titleEn"),
    slug: ensureSlug(formString(formData, "slug"), titleBn),
    description: nullableFormString(formData, "description"),
    videoUrl: formString(formData, "videoUrl"),
    thumbnailId: nullableFormString(formData, "thumbnailId"),
    categoryId: nullableFormString(formData, "categoryId"),
    createdById: session.user.id,
    publishedAt: formDate(formData, "publishedAt")
  });

  revalidatePath("/admin/videos");
  redirect("/admin/videos");
}

export async function createGalleryAction(formData: FormData) {
  const session = await requireStaffSession(["admin", "editor", "journalist"]);
  const titleBn = formString(formData, "titleBn");

  if (!titleBn) {
    throw new Error("Bangla gallery title is required.");
  }

  const [gallery] = await db
    .insert(galleries)
    .values({
      titleBn,
      titleEn: nullableFormString(formData, "titleEn"),
      slug: ensureSlug(formString(formData, "slug"), titleBn),
      description: nullableFormString(formData, "description"),
      coverImageId: nullableFormString(formData, "coverImageId"),
      categoryId: nullableFormString(formData, "categoryId"),
      createdById: session.user.id,
      publishedAt: formDate(formData, "publishedAt")
    })
    .returning();

  const mediaIds = formString(formData, "mediaIds")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (gallery) {
    for (const [index, mediaAssetId] of mediaIds.entries()) {
      await db
        .insert(galleryImages)
        .values({
          galleryId: gallery.id,
          mediaAssetId,
          sortOrder: index
        })
        .onConflictDoNothing();
    }
  }

  revalidatePath("/admin/galleries");
  redirect("/admin/galleries");
}

export async function removeGalleryImageAction(galleryId: string, mediaAssetId: string) {
  await requireStaffSession(["admin", "editor", "journalist"]);

  await db
    .delete(galleryImages)
    .where(and(eq(galleryImages.galleryId, galleryId), eq(galleryImages.mediaAssetId, mediaAssetId)));

  revalidatePath("/admin/galleries");
}
