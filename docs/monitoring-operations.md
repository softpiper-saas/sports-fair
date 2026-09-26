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
UPTIME_KUMA_ADMIN_PASSWORD=
```

## VPS Access Rules

Public:

- The Sportsfair website.
- `GET /api/health`.

Private or protected:

- Grafana.
- Prometheus.
- Loki.
- Grafana Alloy.
- cAdvisor.
- Node Exporter.

Do not expose Prometheus, cAdvisor, Loki or Node Exporter directly to the public internet.

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
