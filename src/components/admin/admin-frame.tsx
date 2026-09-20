import Link from "next/link";
import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import type { AuthSession } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/breaking", label: "Breaking" },
  { href: "/admin/sports", label: "Sports" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/galleries", label: "Galleries" }
];

type AdminFrameProps = {
  children: React.ReactNode;
  session: AuthSession & { user: AuthSession["user"] & { role?: string | null } };
  title: string;
  description?: string;
};

export function AdminFrame({ children, description, session, title }: AdminFrameProps) {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">Sportsfair Admin</p>
              <h1 className="text-2xl font-semibold">{title}</h1>
              {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
            </div>
            <div className="flex items-center gap-3">
              <p className="hidden text-right text-sm text-muted-foreground md:block">
                {session.user.name}
                <br />
                {session.user.role ?? "staff"}
              </p>
              <AdminSignOutButton />
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                className="whitespace-nowrap rounded-md border px-3 py-2 text-sm font-medium hover:bg-secondary"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-8">{children}</section>
    </main>
  );
}
