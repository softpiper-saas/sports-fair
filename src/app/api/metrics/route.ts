import { NextResponse, type NextRequest } from "next/server";
import { collectMetricsForScrape, metricsContentType } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = process.env.METRICS_BEARER_TOKEN;

  if (token) {
    const expected = `Bearer ${token}`;
    const actual = request.headers.get("authorization");

    if (actual !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return new Response(await collectMetricsForScrape(), {
    headers: {
      "cache-control": "no-store",
      "content-type": metricsContentType
    }
  });
}
