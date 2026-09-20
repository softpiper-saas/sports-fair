import Link from "next/link";
import { Search } from "lucide-react";
import { PageShell } from "@/components/public/page-shell";
import { formatBanglaDate } from "@/lib/public/content";
import { searchSite } from "@/lib/public/search";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "সার্চ | Sportsfair",
  description: "Sportsfair খবর, দল, খেলোয়াড়, টুর্নামেন্ট ও ম্যাচ খুঁজুন।"
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = Array.isArray(params.q) ? params.q[0] : params.q ?? "";
  const results = await searchSite(q);
  const hasQuery = q.trim().length > 0;

  return (
    <PageShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-neutral-200 pb-5">
          <p className="text-sm font-bold text-primary">Sportsfair</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-neutral-950">সার্চ</h1>
          <form className="mt-5 flex max-w-2xl gap-2" action="/search">
            <input
              className="min-w-0 flex-1 rounded-md border border-neutral-300 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary"
              defaultValue={q}
              name="q"
              placeholder="খবর, দল, খেলোয়াড় বা ম্যাচ খুঁজুন"
            />
            <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
              <Search className="size-4" />
              খুঁজুন
            </button>
          </form>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
            <ResultSection title="খবর">
              {results.articles.length > 0 ? (
                results.articles.map((item) => (
                  <Link className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:text-primary" href={`/news/${item.slug}`} key={item.id}>
                    <h2 className="text-xl font-black">{item.title}</h2>
                    {item.summary ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.summary}</p> : null}
                    <p className="mt-3 text-xs text-muted-foreground">{formatBanglaDate(item.publishedAt)}</p>
                  </Link>
                ))
              ) : (
                <Empty text={hasQuery ? "খবর পাওয়া যায়নি।" : "সার্চ শুরু করতে শব্দ লিখুন।"} />
              )}
            </ResultSection>

            <ResultSection title="ম্যাচ">
              {results.matches.length > 0 ? (
                results.matches.map((item) => (
                  <Link className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:text-primary" href={`/match/${item.slug}`} key={item.id}>
                    <h2 className="text-lg font-black">{item.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{item.subtitle || formatBanglaDate(item.startsAt)}</p>
                  </Link>
                ))
              ) : (
                <Empty text={hasQuery ? "ম্যাচ পাওয়া যায়নি।" : "ম্যাচ সার্চের ফল এখানে দেখা যাবে।"} />
              )}
            </ResultSection>
          </div>

          <aside className="grid content-start gap-6">
            <CompactSection title="দল" hrefPrefix="/team" items={results.teams} />
            <CompactSection title="খেলোয়াড়" hrefPrefix="/player" items={results.players} />
            <CompactSection title="টুর্নামেন্ট" hrefPrefix="/tournament" items={results.tournaments} />
          </aside>
        </section>
      </main>
    </PageShell>
  );
}

function ResultSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-black">{title}</h2>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function CompactSection({
  hrefPrefix,
  items,
  title
}: {
  hrefPrefix: string;
  items: { id: string; title: string; subtitle: string | null; slug: string }[];
  title: string;
}) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.length > 0 ? (
          items.map((item) => (
            <Link className="rounded-md border p-3 font-bold hover:text-primary" href={`${hrefPrefix}/${item.slug}`} key={item.id}>
              {item.title}
              {item.subtitle ? <span className="block text-xs font-normal text-muted-foreground">{item.subtitle}</span> : null}
            </Link>
          ))
        ) : (
          <Empty text="ফল নেই।" />
        )}
      </div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">{text}</p>;
}
