import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { getRequestId } from "@/lib/observability/request-id";

export const dynamic = "force-dynamic";

const startedAt = new Date();
const databaseTimeoutMs = 1500;

type HealthCheck = {
  status: "ok" | "error";
  latencyMs?: number;
  message?: string;
};

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeout: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

async function checkDatabase(): Promise<HealthCheck> {
  const started = performance.now();

  try {
    await withTimeout(db.execute(sql`select 1`), databaseTimeoutMs);

    return {
      status: "ok",
      latencyMs: Math.round(performance.now() - started)
    };
  } catch (error) {
    return {
      status: "error",
      latencyMs: Math.round(performance.now() - started),
      message: error instanceof Error ? error.message : "Database check failed"
    };
  }
}

export async function GET() {
  const [requestId, database] = await Promise.all([getRequestId(), checkDatabase()]);
  const healthy = database.status === "ok";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "error",
      service: "sportsfair-web",
      environment: process.env.NODE_ENV ?? "unknown",
      version: process.env.APP_VERSION ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "development",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round((Date.now() - startedAt.getTime()) / 1000),
      startedAt: startedAt.toISOString(),
      requestId,
      checks: {
        app: {
          status: "ok"
        },
        database
      }
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        "cache-control": "no-store"
      }
    }
  );
}
