import { NextResponse, type NextRequest } from "next/server";
import { getMatchesForList } from "@/lib/public/matches";

export async function GET(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get("kind");
  const safeKind = kind === "results" || kind === "schedule" || kind === "live" ? kind : "live";
  const matches = await getMatchesForList(safeKind, 50);

  return NextResponse.json({ matches });
}
