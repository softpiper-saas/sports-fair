import { Newspaper, ShieldCheck, Trophy, Users } from "lucide-react";
import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import { requireStaffSession } from "@/lib/auth-guard";

const sections = [
  {
    title: "Editorial CMS",
    description: "Create articles, breaking news, videos and galleries.",
    icon: Newspaper
  },
  {
    title: "Sports Data",
    description: "Manage teams, players, tournaments, matches and standings.",
    icon: Trophy
  },
  {
    title: "Staff",
    description: "Invite and manage staff roles through Better Auth admin tools.",
    icon: Users
  }
];

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requireStaffSession();

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-sm font-medium text-primary">Sportsfair Admin</p>
            <h1 className="text-2xl font-semibold">Editorial console</h1>
          </div>
          <AdminSignOutButton />
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8">
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Signed in as {session.user.name}</h2>
              <p className="text-sm text-muted-foreground">
                {session.user.email} · {session.user.role ?? "staff"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <article key={section.title} className="rounded-lg border bg-card p-5">
                <Icon className="h-5 w-5 text-primary" />
                <h2 className="mt-4 text-lg font-semibold">{section.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
