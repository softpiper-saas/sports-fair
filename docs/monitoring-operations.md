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
docker compose -f monitoring/docker-compose.monitoring.yml up -d
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

Phase 2 sends Docker logs to Loki through Grafana Alloy. Grafana provisions the Loki datasource and a `Sportsfair Logs` dashboard automatically.

Useful starter LogQL queries:

```text
{app="sportsfair"} | json | level >= 50
{app="sportsfair", event="http_request"} | json | durationMs > 1000
{app="sportsfair"} |~ "(sports|sync)"
{app="sportsfair"} |~ "(auth|login|forbidden)"
```

Structured application logs should include `requestId` when available. Use the `x-request-id` response header from a failed request to search related logs.
