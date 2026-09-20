import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/public/page-shell";
import { toBanglaDigits } from "@/lib/slug";
import { getStandingsForTournament, getTournamentBySlug } from "@/lib/public/sports-catalog";

export const dynamic = "force-dynamic";

type StandingsPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: StandingsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(decodeURIComponent(slug));

  return {
    title: tournament ? `${tournament.nameBn} পয়েন্ট টেবিল | Sportsfair` : "পয়েন্ট টেবিল | Sportsfair",
    description: tournament ? `${tournament.nameBn} পয়েন্ট টেবিল।` : undefined
  };
}

export default async function StandingsPage({ params }: StandingsPageProps) {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(decodeURIComponent(slug));

  if (!tournament) {
    notFound();
  }

  const rows = await getStandingsForTournament(tournament.id);

  return (
    <PageShell>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-neutral-200 pb-5">
          <p className="text-sm font-bold text-primary">{tournament.nameBn}</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-neutral-950">পয়েন্ট টেবিল</h1>
        </header>

        <section className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          {rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-neutral-950 text-white">
                  <tr>
                    <th className="px-4 py-3">দল</th>
                    <th className="px-4 py-3 text-center">M</th>
                    <th className="px-4 py-3 text-center">W</th>
                    <th className="px-4 py-3 text-center">D</th>
                    <th className="px-4 py-3 text-center">L</th>
                    <th className="px-4 py-3 text-center">GD</th>
                    <th className="px-4 py-3 text-center">NRR</th>
                    <th className="px-4 py-3 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr className="border-t" key={row.id}>
                      <td className="px-4 py-3 font-bold">
                        <Link className="hover:text-primary" href={`/team/${row.teamSlug}`}>
                          {row.teamName}
                        </Link>
                      </td>
                      <NumberCell value={row.played} />
                      <NumberCell value={row.won} />
                      <NumberCell value={row.drawn} />
                      <NumberCell value={row.lost} />
                      <NumberCell value={row.goalDifference} />
                      <td className="px-4 py-3 text-center font-semibold">{row.netRunRate || "-"}</td>
                      <NumberCell value={row.points} strong />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-8 text-sm text-muted-foreground">এই টুর্নামেন্টের টেবিল এখনো যোগ করা হয়নি।</p>
          )}
        </section>
      </main>
    </PageShell>
  );
}

function NumberCell({ value, strong = false }: { value: number | null; strong?: boolean }) {
  return (
    <td className={`px-4 py-3 text-center ${strong ? "font-black" : "font-semibold"}`}>
      {value === null || value === undefined ? "-" : toBanglaDigits(value)}
    </td>
  );
}
