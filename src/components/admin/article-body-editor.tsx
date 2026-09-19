"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useEffect, useRef } from "react";
import type { PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";

const fallbackContent: PartialBlock[] = [
  {
    type: "paragraph",
    content: ""
  }
];

type ArticleBodyEditorProps = {
  initialBlocks?: unknown;
  initialHtml?: string | null;
};

export function ArticleBodyEditor({ initialBlocks, initialHtml }: ArticleBodyEditorProps) {
  const bodyJsonRef = useRef<HTMLTextAreaElement>(null);
  const bodyHtmlRef = useRef<HTMLTextAreaElement>(null);
  const editor = useCreateBlockNote({
    initialContent: Array.isArray(initialBlocks) && initialBlocks.length > 0 ? (initialBlocks as PartialBlock[]) : fallbackContent
  });

  async function syncHiddenFields() {
    if (bodyJsonRef.current) {
      bodyJsonRef.current.value = JSON.stringify(editor.document);
    }

    if (bodyHtmlRef.current) {
      bodyHtmlRef.current.value = await editor.blocksToHTMLLossy(editor.document);
    }
  }

  useEffect(() => {
    void syncHiddenFields();
  });

  return (
    <div className="rounded-lg border bg-card p-3">
      <BlockNoteView editor={editor} theme="light" onChange={() => void syncHiddenFields()} />
      <textarea aria-hidden className="hidden" defaultValue="" name="bodyJson" ref={bodyJsonRef} />
      <textarea aria-hidden className="hidden" defaultValue={initialHtml ?? ""} name="bodyHtml" ref={bodyHtmlRef} />
    </div>
  );
}
