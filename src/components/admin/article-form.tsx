import { ArticleBodyEditor } from "@/components/admin/article-body-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { articles, categories, mediaAssets, tags } from "@/db/schema";

type Article = typeof articles.$inferSelect;
type Category = typeof categories.$inferSelect;
type MediaAsset = typeof mediaAssets.$inferSelect;
type Tag = typeof tags.$inferSelect;

type ArticleFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  article?: Article | null;
  categories: Category[];
  media: MediaAsset[];
  tags?: Tag[];
};

function datetimeLocalValue(value: Date | null) {
  if (!value) {
    return "";
  }

  return new Date(value.getTime() - value.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function ArticleForm({ action, article, categories, media, tags = [] }: ArticleFormProps) {
  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <Input defaultValue={article?.headlineBn ?? ""} name="headlineBn" placeholder="Bangla headline" required />
        <Input defaultValue={article?.headlineEn ?? ""} name="headlineEn" placeholder="English headline optional" />
        <Input defaultValue={article?.slug ?? ""} name="slug" placeholder="Bangla slug, optional" />
        <textarea
          className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          defaultValue={article?.summary ?? ""}
          name="summary"
          placeholder="Short summary"
        />
        <ArticleBodyEditor initialBlocks={article?.bodyJson} initialHtml={article?.bodyHtml} />
      </div>

      <aside className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-base font-semibold">Publishing</h2>
          <div className="mt-4 space-y-3">
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              defaultValue={article?.status ?? "draft"}
              name="status"
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              defaultValue={article?.breaking ?? "normal"}
              name="breaking"
            >
              <option value="normal">Normal</option>
              <option value="breaking">Breaking</option>
              <option value="major_breaking">Major breaking</option>
              <option value="developing">Developing</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input defaultChecked={article?.featured ?? false} name="featured" type="checkbox" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input defaultChecked={article?.sponsored ?? false} name="sponsored" type="checkbox" />
              Sponsored
            </label>
            <Input
              defaultValue={datetimeLocalValue(article?.publishedAt ?? null)}
              name="publishedAt"
              type="datetime-local"
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-base font-semibold">Metadata</h2>
          <div className="mt-4 space-y-3">
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              defaultValue={article?.categoryId ?? ""}
              name="categoryId"
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nameBn}
                </option>
              ))}
            </select>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              defaultValue={article?.heroImageId ?? ""}
              name="heroImageId"
            >
              <option value="">No hero image</option>
              {media.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.altBn || asset.objectKey}
                </option>
              ))}
            </select>
            <Input defaultValue={tags.map((tag) => tag.nameBn).join(", ")} name="tags" placeholder="Tags, comma separated" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-base font-semibold">Sponsor</h2>
          <div className="mt-4 space-y-3">
            <Input defaultValue={article?.sponsorName ?? ""} name="sponsorName" placeholder="Sponsor name" />
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              defaultValue={article?.sponsorLogoId ?? ""}
              name="sponsorLogoId"
            >
              <option value="">No sponsor logo</option>
              {media.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.altBn || asset.objectKey}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-base font-semibold">SEO</h2>
          <div className="mt-4 space-y-3">
            <Input defaultValue={article?.seoTitle ?? ""} name="seoTitle" placeholder="SEO title" />
            <textarea
              className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={article?.seoDescription ?? ""}
              name="seoDescription"
              placeholder="SEO description"
            />
            <Input defaultValue={article?.canonicalUrl ?? ""} name="canonicalUrl" placeholder="Canonical URL" />
          </div>
        </div>

        <Button className="w-full" type="submit">
          Save article
        </Button>
      </aside>
    </form>
  );
}
