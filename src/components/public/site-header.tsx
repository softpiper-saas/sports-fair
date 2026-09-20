import Link from "next/link";
import { Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type NavCategory = {
  nameBn: string;
  slug: string;
};

const fallbackNav = [
  { nameBn: "ক্রিকেট", slug: "ক্রিকেট" },
  { nameBn: "ফুটবল", slug: "ফুটবল" },
  { nameBn: "বাংলাদেশ", slug: "বাংলাদেশ" },
  { nameBn: "আন্তর্জাতিক", slug: "আন্তর্জাতিক" },
  { nameBn: "মতামত", slug: "মতামত" }
];

export function SiteHeader({ categories }: { categories: NavCategory[] }) {
  const navItems = categories.length > 0 ? categories : fallbackNav;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Sportsfair হোম">
          <span className="grid size-10 place-items-center rounded-md bg-primary text-lg font-black text-primary-foreground">
            S
          </span>
          <span>
            <span className="block text-xl font-black leading-none tracking-normal">Sportsfair</span>
            <span className="text-xs font-medium text-muted-foreground">বাংলা স্পোর্টস নিউজ</span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="outline" className="h-9 px-3">
            <Link href="/admin">
              <ShieldCheck className="size-4" />
              স্টাফ
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="সার্চ">
            <Search className="size-5" />
          </Button>
        </div>
      </div>

      <nav className="border-t border-neutral-100">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          <NavLink href="/">হোম</NavLink>
          <NavLink href="/latest">সর্বশেষ</NavLink>
          <NavLink href="/live">লাইভ স্কোর</NavLink>
          <NavLink href="/schedule">ম্যাচ সূচি</NavLink>
          {navItems.map((item) => (
            <NavLink key={item.slug} href={`/section/${encodeURIComponent(item.slug)}`}>
              {item.nameBn}
            </NavLink>
          ))}
          <NavLink href="/results">ফলাফল</NavLink>
          <NavLink href="/videos">ভিডিও</NavLink>
          <NavLink href="/photos">ছবি</NavLink>
        </div>
      </nav>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="shrink-0 rounded-md px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
    >
      {children}
    </Link>
  );
}
