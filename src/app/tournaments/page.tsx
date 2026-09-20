import Link from "next/link";
import { PageShell } from "@/components/public/page-shell";
import { getTournaments } from "@/lib/public/sports-catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "টুর্নামেন্ট | Sportsfair",
  description: "Sportsfair টুর্নামেন্ট তালিকা।"
};

export default async function TournamentsPage() {
  const tournaments = await getTournaments();

  return (
    <PageShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-neutral-200 pb-5">
          <p className="text-sm font-bold text-primary">স্পোর্টস ডেটা</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-neutral-950">টুর্নামেন্ট</h1>
        </header>
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tournaments.map((tournament) => (
            <Link className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition hover:text-primary" href={`/tournament/${tournament.slug}`} key={tournament.id}>
              <h2 className="text-xl font-black">{tournament.nameBn}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{tournament.sportName ?? "খেলা"}</p>
            </Link>
          ))}
          {tournaments.length === 0 ? <EmptyState text="এখনো কোনো টুর্নামেন্ট যোগ করা হয়নি।" /> : null}
        </section>
      </main>
    </PageShell>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-sm text-muted-foreground">{text}</p>;
}
