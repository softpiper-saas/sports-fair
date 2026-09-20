import { Flame, LayoutGrid, Newspaper, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { AdminFrame } from "@/components/admin/admin-frame";
import { requireStaffSession } from "@/lib/auth-guard";

const sections = [
  {
    title: "Editorial CMS",
    description: "Create articles, breaking news, videos and galleries.",
    href: "/admin/articles",
    icon: Newspaper
  },
  {
    title: "Homepage Control",
    description: "Curate lead stories, editor picks and homepage sections.",
    href: "/admin/homepage",
    icon: LayoutGrid
  },
  {
    title: "Breaking Console",
    description: "Publish active breaking banners with priority and timing.",
    href: "/admin/breaking",
    icon: Flame
  },
  {
    title: "Sports Data",
    description: "Manage teams, players, tournaments, matches and standings.",
    href: "/admin",
    icon: Trophy
  },
  {
    title: "Staff",
    description: "Invite and manage staff roles through Better Auth admin tools.",
    href: "/admin",
    icon: Users
  }
];

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requireStaffSession();

  return (
    <AdminFrame
      description="Staff-only publishing and sports data workspace."
      session={session}
      title="Editorial console"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Link className="rounded-lg border bg-card p-5 hover:bg-secondary" href={section.href} key={section.title}>
              <Icon className="h-5 w-5 text-primary" />
              <h2 className="mt-4 text-lg font-semibold">{section.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
            </Link>
          );
        })}
      </div>
    </AdminFrame>
  );
}
