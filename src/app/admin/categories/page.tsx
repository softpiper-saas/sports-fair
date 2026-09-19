import { asc } from "drizzle-orm";
import { createCategoryAction } from "@/app/admin/cms-actions";
import { AdminFrame } from "@/components/admin/admin-frame";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireStaffSession } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const session = await requireStaffSession(["admin", "editor", "journalist"]);
  const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.nameBn));

  return (
    <AdminFrame description="Manage first-class editorial sections and article categories." session={session} title="Categories">
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <form action={createCategoryAction} className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="text-base font-semibold">New category</h2>
          <Input name="nameBn" placeholder="Bangla name" required />
          <Input name="nameEn" placeholder="English name optional" />
          <Input name="slug" placeholder="Bangla slug optional" />
          <Input name="sortOrder" placeholder="Sort order" type="number" />
          <textarea
            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            name="description"
            placeholder="Description"
          />
          <Button className="w-full" type="submit">
            Save category
          </Button>
        </form>

        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Order</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((category) => (
                <tr className="border-t" key={category.id}>
                  <td className="px-4 py-3 font-medium">{category.nameBn}</td>
                  <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
                  <td className="px-4 py-3">{category.sortOrder}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-muted-foreground" colSpan={3}>
                    No categories yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </AdminFrame>
  );
}
