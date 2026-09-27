import "server-only";

import { sql } from "drizzle-orm";
import { collectDefaultMetrics, Counter, Gauge, Histogram, register } from "prom-client";
import { db } from "@/db";
import { childLogger } from "@/lib/logger";

type LabelValues = Record<string, string | number>;

declare global {
  var sportsfairDefaultMetricsStarted: boolean | undefined;
}

const metricsLogger = childLogger({ component: "metrics" });

if (!globalThis.sportsfairDefaultMetricsStarted) {
  collectDefaultMetrics({
    prefix: "sportsfair_node_",
    register
  });
  globalThis.sportsfairDefaultMetricsStarted = true;
}

function getCounter(name: string, help: string, labelNames: string[]) {
  return (register.getSingleMetric(name) as Counter<string> | undefined) ?? new Counter({ help, labelNames, name });
}

function getGauge(name: string, help: string, labelNames: string[] = []) {
  return (register.getSingleMetric(name) as Gauge<string> | undefined) ?? new Gauge({ help, labelNames, name });
}

function getHistogram(name: string, help: string, labelNames: string[], buckets: number[]) {
  return (register.getSingleMetric(name) as Histogram<string> | undefined) ?? new Histogram({ buckets, help, labelNames, name });
}

const httpRequestsTotal = getCounter("sportsfair_http_requests_total", "Total HTTP requests handled by the Sportsfair app.", ["method", "route", "status_code"]);
const httpRequestErrorsTotal = getCounter("sportsfair_http_request_errors_total", "Total failed HTTP requests handled by the Sportsfair app.", [
  "method",
  "route",
  "status_code"
]);
const httpRequestDurationSeconds = getHistogram(
  "sportsfair_http_request_duration_seconds",
  "HTTP request duration in seconds for Sportsfair routes.",
  ["method", "route", "status_code"],
  [0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
);

const databaseHealthUp = getGauge("sportsfair_database_health_up", "Whether the application database health check is currently passing.");
const databaseHealthLatencySeconds = getGauge("sportsfair_database_health_latency_seconds", "Application database health check latency in seconds.");
const articleEngagementEventsTotal = getCounter("sportsfair_article_engagement_events_total", "Article engagement events accepted or rejected by the app.", [
  "event_type",
  "status"
]);
const commentSubmissionsTotal = getCounter("sportsfair_comment_submissions_total", "Article comment submission outcomes.", ["status"]);
const pollVotesTotal = getCounter("sportsfair_poll_votes_total", "Poll vote submission outcomes.", ["status"]);
const matchCount = getGauge("sportsfair_match_count", "Current number of matches by status.", ["status"]);
const matchDataFreshnessSeconds = getGauge("sportsfair_match_data_freshness_seconds", "Age in seconds of the freshest match sync/update by status. -1 means no match data.", [
  "status"
]);
const commentModerationBacklog = getGauge("sportsfair_comment_moderation_backlog", "Number of pending article comments awaiting moderation.");

export const metricsContentType = register.contentType;

export function recordHttpRequest(input: { durationSeconds: number; method: string; route: string; statusCode: number }) {
  const labels = httpLabels(input.method, input.route, input.statusCode);
  httpRequestsTotal.inc(labels);
  httpRequestDurationSeconds.observe(labels, input.durationSeconds);

  if (input.statusCode >= 500) {
    httpRequestErrorsTotal.inc(labels);
  }
}

export async function observeHttpRequest(run: () => Promise<Response>, input: { method: string; route: string }) {
  const started = performance.now();

  try {
    const response = await run();
    recordHttpRequest({
      durationSeconds: elapsedSeconds(started),
      method: input.method,
      route: input.route,
      statusCode: response.status
    });
    return response;
  } catch (error) {
    recordHttpRequest({
      durationSeconds: elapsedSeconds(started),
      method: input.method,
      route: input.route,
      statusCode: 500
    });
    throw error;
  }
}

export function withRouteMetrics<TArgs extends unknown[]>(route: string, method: string, handler: (...args: TArgs) => Promise<Response>) {
  return (...args: TArgs) => observeHttpRequest(() => handler(...args), { method, route });
}

export function recordDatabaseHealth(ok: boolean, latencyMs: number) {
  databaseHealthUp.set(ok ? 1 : 0);
  databaseHealthLatencySeconds.set(Math.max(latencyMs, 0) / 1000);
}

export function recordArticleEngagementEvent(eventType: "view" | "share" | "unknown", status: "accepted" | "invalid" | "not_found" | "error") {
  articleEngagementEventsTotal.inc({ event_type: eventType, status });
}

export function recordCommentSubmission(status: "accepted" | "validation_error" | "article_unavailable" | "error") {
  commentSubmissionsTotal.inc({ status });
}

export function recordPollVote(status: "accepted" | "validation_error" | "option_unavailable" | "error") {
  pollVotesTotal.inc({ status });
}

export async function collectMetricsForScrape() {
  const started = performance.now();

  try {
    await collectDatabaseBackedMetrics();
    recordDatabaseHealth(true, performance.now() - started);
  } catch (error) {
    recordDatabaseHealth(false, performance.now() - started);
    metricsLogger.error({ error }, "Failed to collect database-backed metrics");
  }

  return register.metrics();
}

async function collectDatabaseBackedMetrics() {
  const result = await db.execute(sql`
    select
      count(*)::float8 as matches_all,
      count(*) filter (where status = 'live')::float8 as matches_live,
      count(*) filter (where status = 'scheduled')::float8 as matches_scheduled,
      count(*) filter (where status = 'completed')::float8 as matches_completed,
      coalesce(extract(epoch from now() - max(coalesce(last_synced_at, updated_at))), -1)::float8 as freshness_all,
      coalesce(extract(epoch from now() - (max(coalesce(last_synced_at, updated_at)) filter (where status = 'live'))), -1)::float8 as freshness_live,
      coalesce(extract(epoch from now() - (max(coalesce(last_synced_at, updated_at)) filter (where status = 'scheduled'))), -1)::float8 as freshness_scheduled,
      coalesce(extract(epoch from now() - (max(coalesce(last_synced_at, updated_at)) filter (where status = 'completed'))), -1)::float8 as freshness_completed,
      (select count(*)::float8 from article_comments where status = 'pending') as pending_comments
    from matches
  `);
  const row = result.rows[0] as Record<string, unknown> | undefined;

  matchCount.set({ status: "all" }, toNumber(row?.matches_all));
  matchCount.set({ status: "live" }, toNumber(row?.matches_live));
  matchCount.set({ status: "scheduled" }, toNumber(row?.matches_scheduled));
  matchCount.set({ status: "completed" }, toNumber(row?.matches_completed));
  matchDataFreshnessSeconds.set({ status: "all" }, toNumber(row?.freshness_all, -1));
  matchDataFreshnessSeconds.set({ status: "live" }, toNumber(row?.freshness_live, -1));
  matchDataFreshnessSeconds.set({ status: "scheduled" }, toNumber(row?.freshness_scheduled, -1));
  matchDataFreshnessSeconds.set({ status: "completed" }, toNumber(row?.freshness_completed, -1));
  commentModerationBacklog.set(toNumber(row?.pending_comments));
}

function httpLabels(method: string, route: string, statusCode: number): LabelValues {
  return {
    method: method.toUpperCase(),
    route,
    status_code: String(statusCode)
  };
}

function elapsedSeconds(started: number) {
  return Math.max(performance.now() - started, 0) / 1000;
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
