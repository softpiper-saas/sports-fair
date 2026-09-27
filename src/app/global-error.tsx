"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="bn">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-[#f7f7f3] px-4 text-neutral-950">
          <section className="max-w-md rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-bold text-primary">Sportsfair</p>
            <h1 className="mt-3 text-2xl font-black">কিছু সমস্যা হয়েছে</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              পেজটি দেখাতে সমস্যা হচ্ছে। আমাদের টিমকে স্বয়ংক্রিয়ভাবে জানানো হয়েছে।
            </p>
            {error.digest ? <p className="mt-3 text-xs text-muted-foreground">Error ID: {error.digest}</p> : null}
            <Button className="mt-5" onClick={reset} type="button">
              আবার চেষ্টা করুন
            </Button>
          </section>
        </main>
      </body>
    </html>
  );
}
