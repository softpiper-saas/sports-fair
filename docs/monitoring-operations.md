# Sportsfair Monitoring Operations

This document records the production monitoring conventions used by the Sportsfair app.

## Health Endpoint

Use:

```text
GET /api/health
```

Expected healthy response:

```json
{
  "status": "ok",
  "service": "sportsfair-web",
  "checks": {
    "app": { "status": "ok" },
    "database": { "status": "ok" }
  }
}
```

The endpoint returns:

- `200` when the application and database check pass.
- `503` when the database check fails or times out.

The response is marked `cache-control: no-store`.

## Request Correlation

Every application request should carry:

```text
x-request-id
```

If an upstream proxy already sends the header, the app forwards it. Otherwise, the app generates a UUID in `src/proxy.ts`.

Use this ID when searching future application logs, Sentry errors and traces.

## Environment Variables

Phase 0 variables:

```text
NEXT_PUBLIC_APP_ENV=development
APP_VERSION=development
LOG_LEVEL=info
METRICS_BEARER_TOKEN=
OTEL_SERVICE_NAME=sportsfair-web
```

Sentry variables for Phase 1:

```text
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

Monitoring service variables for Phase 1:

```text
GRAFANA_ADMIN_PASSWORD=
GRAFANA_PORT=127.0.0.1:3001
PROMETHEUS_PORT=127.0.0.1:9090
PROMETHEUS_RETENTION=15d
LOKI_PORT=127.0.0.1:3100
ALLOY_PORT=127.0.0.1:12345
PROMETHEUS_EXTERNAL_URL=http://localhost:9090
ALERTMANAGER_PORT=127.0.0.1:9093
ALERTMANAGER_EXTERNAL_URL=http://localhost:9093
DISCORD_ALERT_WEBHOOK_URL=
DISCORD_ALERT_USERNAME=Sportsfair Alerts
DISCORD_ALERT_AVATAR_URL=
UPTIME_KUMA_ADMIN_PASSWORD=
UPTIME_KUMA_PORT=127.0.0.1:3002
```

## Sentry Sampling

```text
SENTRY_TRACES_SAMPLE_RATE=0.1
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.05
NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=0
NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0
```

## Phase 1 Monitoring Stack

Start the VPS monitoring stack with:

```bash
docker compose --env-file .env -f monitoring/docker-compose.monitoring.yml up -d
```

Local-only default ports:

```text
Grafana: http://127.0.0.1:3001
Prometheus: http://127.0.0.1:9090
Uptime Kuma: http://127.0.0.1:3002
Alertmanager: http://127.0.0.1:9093
Loki: http://127.0.0.1:3100
Grafana Alloy: http://127.0.0.1:12345
```

Use an SSH tunnel, VPN or reverse-proxy auth to access these dashboards remotely.

If Compose reports that `GRAFANA_ADMIN_PASSWORD` or `DISCORD_ALERT_WEBHOOK_URL` is missing even though they exist in the root `.env`, run Compose from the repo root with `--env-file .env`. Compose interpolates `${...}` values before containers start, and `env_file` entries inside services do not satisfy that interpolation step.

cAdvisor is opt-in with the `cadvisor` profile because it needs direct access to the Docker data root, usually `/var/lib/docker`, which is unavailable on some local Docker setups. Enable it on a compatible Linux VPS with `docker compose --env-file .env -f monitoring/docker-compose.monitoring.yml --profile cadvisor up -d` and add the `cadvisor:8080` scrape target back if you want container-level cAdvisor metrics.

Node Exporter uses a plain read-only root mount (`/:/host:ro`) in the default stack so it works on Docker hosts where `/` is not configured as a shared or slave mount. On a VPS where mount propagation is configured, you can change it back to `/:/host:ro,rslave` if you need more complete filesystem mount visibility.

## VPS Access Rules

Public:

- The Sportsfair website.
- `GET /api/health`.

Private or protected:

- Grafana.
- Prometheus.
- Alertmanager.
- Loki.
- Grafana Alloy.
- cAdvisor.
- Node Exporter.
- Discord alert bridge.

Do not expose Prometheus, Alertmanager, Grafana Alloy, cAdvisor, Loki, Node Exporter or the Discord alert bridge directly to the public internet.

## Initial Uptime Checks

Configure the uptime monitor to check:

- `/`
- `/api/health`
- SSL certificate validity
- Response time

Suggested first threshold:

- Homepage unavailable for 2 consecutive checks.
- Health endpoint returns non-2xx for 2 consecutive checks.
- SSL certificate expires within 14 days.

## Phase 1 Alerts

Prometheus loads starter rules from:

```text
monitoring/prometheus/rules/sportsfair-alerts.yml
```

Included rules:

- target down
- high CPU
- high memory
- low disk space
- container restart

Alert notifications are routed through Alertmanager to Discord via `monitoring/alertmanager/discord-webhook.mjs`. Set `DISCORD_ALERT_WEBHOOK_URL` in `.env` before starting the monitoring stack.

## Discord Alert Test

After setting `DISCORD_ALERT_WEBHOOK_URL`, restart the monitoring stack and trigger a temporary alert by stopping a scrape target or by posting a sample Alertmanager payload to the bridge from inside the Compose network.

The Discord bridge health endpoint is internal only:

```text
http://discord-alert-bridge:8080/health
```

## Centralized Logs

Phase 2 sends Docker logs to Loki through Grafana Alloy. Grafana provisions the Loki datasource and a `Sportsfair Logs` dashboard automatically. Alloy collects Docker logs through `/var/run/docker.sock`, so this setup works on hosts where `/var/lib/docker/containers` is unavailable or read-only.

Useful starter LogQL queries:

```text
{app="sportsfair"} | json | level >= 50
{app="sportsfair", event="http_request"} | json | durationMs > 1000
{app="sportsfair"} |~ "(sports|sync)"
{app="sportsfair"} |~ "(auth|login|forbidden)"
```

Structured application logs should include `requestId` when available. Use the `x-request-id` response header from a failed request to search related logs.

## Application Metrics

Phase 3 exposes Prometheus metrics at:

```text
GET /api/metrics
```

By default this endpoint is intended for private network scraping. If `METRICS_BEARER_TOKEN` is set, requests must include:

```text
Authorization: Bearer <token>
```

The monitoring Compose file scrapes the local development app at `host.docker.internal:3000/api/metrics`. On a VPS, update the `sportsfair-app` target in `monitoring/prometheus/prometheus.yml` if the app listens somewhere else internally.

Important exported metrics include:

- `sportsfair_http_requests_total`
- `sportsfair_http_request_duration_seconds`
- `sportsfair_database_health_up`
- `sportsfair_database_health_latency_seconds`
- `sportsfair_article_engagement_events_total`
- `sportsfair_comment_submissions_total`
- `sportsfair_poll_votes_total`
- `sportsfair_match_count`
- `sportsfair_match_data_freshness_seconds`
- `sportsfair_comment_moderation_backlog`

Grafana provisions the `Sportsfair Application Metrics` dashboard automatically. Application alert rules are in `monitoring/prometheus/rules/sportsfair-alerts.yml`.

## Development Container Dependencies

The development Compose stack uses a named `node_modules` volume. If the app container reports `Cannot find module` for a package that exists in `package.json`, rebuild or refresh that volume:

```bash
docker compose down
docker compose up --build
```

The app and sports sync services run `npm install` before starting in development so the named volume catches up after dependency changes.
