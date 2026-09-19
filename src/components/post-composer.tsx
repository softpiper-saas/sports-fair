"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  title: z.string().trim().min(3, "Use at least 3 characters."),
  content: z.string().trim().min(1, "Content is required.")
});

export function PostComposer() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = formSchema.safeParse({ title, content });

    if (!result.success) {
      setMessage(result.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    setMessage("Ready to POST to /api/posts once the database migration has run.");
  }

  return (
    <form className="rounded-lg border bg-card p-5 text-card-foreground" onSubmit={onSubmit}>
      <h2 className="text-lg font-semibold">Validated input</h2>
      <p className="mt-1 text-sm text-muted-foreground">The API route validates with Zod and sanitizes HTML before saving.</p>
      <div className="mt-5 flex flex-col gap-3">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Post title" />
        <textarea
          className="min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="<p>Write sanitized HTML here</p>"
        />
        <Button type="submit" className="w-full">
          <Send className="h-4 w-4" />
          Validate draft
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
    </form>
  );
}
