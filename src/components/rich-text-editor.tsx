"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function RichTextEditor() {
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) {
    return (
      <section className="min-h-[520px] rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Loading editor...
      </section>
    );
  }

  return <MountedRichTextEditor />;
}

function MountedRichTextEditor() {
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: "heading",
        content: "Match notes"
      },
      {
        type: "paragraph",
        content: "Use this BlockNote editor for rich text content."
      }
    ]
  });

  return (
    <section className="min-h-[520px] rounded-lg border bg-card p-3 text-card-foreground">
      <BlockNoteView editor={editor} theme="light" />
    </section>
  );
}
