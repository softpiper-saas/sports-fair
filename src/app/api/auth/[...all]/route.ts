import { auth } from "@/lib/auth";
import { withRouteMetrics } from "@/lib/metrics";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

export const GET = withRouteMetrics("/api/auth", "GET", handlers.GET);
export const POST = withRouteMetrics("/api/auth", "POST", handlers.POST);
