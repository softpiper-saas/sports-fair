import { RichTextEditor } from "@/components/rich-text-editor";
import { CounterPanel } from "@/components/counter-panel";
import { PostComposer } from "@/components/post-composer";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-8">
      <header className="flex flex-col gap-3 border-b pb-6">
        <p className="text-sm font-medium text-primary">Sportsfair</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-foreground">
          Next.js development scaffold
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          TypeScript, Tailwind CSS, shadcn/ui, Redux, Drizzle, PostgreSQL, Zod, sanitized input, BlockNote, Docker, GitHub Actions, and Playwright are wired together.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <RichTextEditor />
        <div className="flex flex-col gap-6">
          <CounterPanel />
          <PostComposer />
        </div>
      </section>
    </main>
  );
}
