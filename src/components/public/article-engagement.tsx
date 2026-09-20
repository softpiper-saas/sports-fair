"use client";

import { useEffect, useState } from "react";
import { Copy, Share2 } from "lucide-react";

type ArticleEngagementProps = {
  articleId: string;
  title: string;
};

export function ArticleEngagement({ articleId, title }: ArticleEngagementProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void sendArticleEvent(articleId, "view");
  }, [articleId]);

  async function shareArticle() {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }

    await sendArticleEvent(articleId, "share");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
    await sendArticleEvent(articleId, "share");
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <button
        className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-neutral-800 transition hover:bg-neutral-100"
        onClick={shareArticle}
        type="button"
      >
        <Share2 className="size-4" />
        শেয়ার
      </button>
      <button
        className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-neutral-800 transition hover:bg-neutral-100"
        onClick={copyLink}
        type="button"
      >
        <Copy className="size-4" />
        {copied ? "কপি হয়েছে" : "লিংক কপি"}
      </button>
    </div>
  );
}

async function sendArticleEvent(articleId: string, eventType: "view" | "share") {
  await fetch(`/api/articles/${articleId}/events`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      eventType,
      path: window.location.pathname,
      referrer: document.referrer || undefined
    }),
    keepalive: true
  }).catch(() => undefined);
}
