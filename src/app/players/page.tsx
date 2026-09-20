import Link from "next/link";
import { PageShell } from "@/components/public/page-shell";
import { getPlayers } from "@/lib/public/sports-catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "খেলোয়াড় | Sportsfair",
  description: "Sportsfair খেলোয়াড় তালিকা।"
};

export default async function PlayersPage() {
  const players = await getPlayers();

  return (
    <PageShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-neutral-200 pb-5">
          <p className="text-sm font-bold text-primary">প্রোফাইল</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-neutral-950">খেলোয়াড়</h1>
        </header>
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {players.map((player) => (
            <Link className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition hover:text-primary" href={`/player/${player.slug}`} key={player.id}>
              <h2 className="text-xl font-black">{player.nameBn}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{player.role || "খেলোয়াড়"}{player.country ? ` · ${player.country}` : ""}</p>
            </Link>
          ))}
          {players.length === 0 ? <EmptyState text="এখনো কোনো খেলোয়াড় যোগ করা হয়নি।" /> : null}
        </section>
      </main>
    </PageShell>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-sm text-muted-foreground">{text}</p>;
}
