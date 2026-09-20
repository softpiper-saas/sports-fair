import Link from "next/link";
import { formatBanglaDate } from "@/lib/public/content";

type StoryLink = {
  id: string;
  headlineBn: string;
  slug: string;
  publishedAt: Date | null;
};

export function StoryLinkList({ stories }: { stories: StoryLink[] }) {
  if (stories.length === 0) {
    return <p className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">এখনো সম্পর্কিত খবর নেই।</p>;
  }

  return (
    <div className="grid gap-3">
      {stories.map((story) => (
        <Link className="rounded-md border p-4 transition hover:text-primary" href={`/news/${encodeURIComponent(story.slug)}`} key={story.id}>
          <span className="font-bold leading-snug">{story.headlineBn}</span>
          <span className="mt-2 block text-xs text-muted-foreground">{formatBanglaDate(story.publishedAt)}</span>
        </Link>
      ))}
    </div>
  );
}
