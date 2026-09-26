# Sportsfair Monitoring Execution Plan

This plan turns `docs/monitoring-plan.md` into an incremental implementation path for the Sportsfair Next.js app on a VPS.

The goal is to make production issues visible quickly, diagnosable from one place, and actionable through alerts.

## Confirmed Direction

- Application: Next.js on a VPS, running with Docker Compose.
- Database: PostgreSQL/Neon for application data.
- Error monitoring: Sentry.
- Structured application logs: Pino.
- Log collection and shipping: Grafana Alloy.
- Log storage: Loki.
- Metrics: Prometheus.
- Server metrics: Node Exporter.
- Container metrics: cAdvisor.
- Dashboards and alerting: Grafana.
- External uptime: Uptime Kuma or a managed external uptime service.
- Tracing later: OpenTelemetry and Grafana Tempo.

## Implementation Principles

- Start with production safety, not perfect observability.
- Keep monitoring services separate from the application container.
- Do not block the app if monitoring tools are unavailable.
- Use structured JSON logs in production.
- Add correlation IDs early so logs, requests and future traces can connect.
- Keep secrets in environment variables.
- Build dashboards from versioned files where practical.
- Treat alerts as product work: alerts should be few, actionable and tested.

## Phase 0: Monitoring Foundations

Goal: prepare the app and deployment environment for observability without adding heavy infrastructure yet.

1. Define production health endpoints.
   - Add `/api/health` for lightweight app health.
   - Check application boot/runtime availability.
   - Optionally check database connectivity with a timeout.
   - Return a stable JSON shape for monitors.

2. Add request correlation.
   - Generate or forward `x-request-id`.
   - Include the request ID in responses.
   - Make it available to logging, API handlers and future tracing.

3. Define environment variables.
   - `SENTRY_DSN`
   - `SENTRY_AUTH_TOKEN`
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`
   - `NEXT_PUBLIC_SENTRY_DSN`
   - `LOG_LEVEL`
   - `OTEL_SERVICE_NAME`
   - `GRAFANA_ADMIN_PASSWORD`
   - `UPTIME_KUMA_ADMIN_PASSWORD`

4. Update deployment documentation.
   - Document which services run on the VPS.
   - Document ports that should remain internal.
   - Document which dashboards are public, private or VPN-only.

Done when:

- Health endpoint exists.
- Request ID convention is decided.
- Production env vars are documented.
- Monitoring ports and access rules are documented.

## Phase 1: Essential Production Monitoring

Goal: know quickly when the app, VPS, database or containers are unhealthy.

1. Add Sentry.
   - Install and configure Sentry for Next.js.
   - Capture server-side errors.
   - Capture browser-side errors.
   - Configure release/environment names.
   - Disable noisy development reporting unless explicitly enabled.

2. Add external uptime monitoring.
   - Deploy Uptime Kuma or configure a managed uptime service.
   - Monitor the homepage.
   - Monitor `/api/health`.
   - Monitor SSL certificate validity.
   - Monitor response time.

3. Add VPS and container metrics.
   - Add Node Exporter to the monitoring Compose stack.
   - Add cAdvisor to the monitoring Compose stack.
   - Add Prometheus scrape config.
   - Add Grafana datasource for Prometheus.

4. Create initial Grafana dashboards.
   - VPS CPU, memory, disk and network.
   - Container CPU, memory, restarts and uptime.
   - Application availability from uptime checks.

5. Add initial alerts.
   - App health check failing.
   - High CPU for sustained period.
   - High memory for sustained period.
   - Low disk space.
   - Container restarts.
   - SSL expiry warning.

Done when:

- Sentry receives a test error from production/staging.
- Grafana shows VPS and container metrics.
- Uptime monitor checks homepage and health endpoint.
- At least one alert notification channel is tested.

## Phase 2: Centralized Logging

Goal: make production troubleshooting possible without SSH-ing into containers.

1. Add Pino structured logging.
   - Replace ad hoc production logs with a shared logger.
   - Include request ID, route, method, status and duration.
   - Include job name and provider when logging background sync work.
   - Keep sensitive values out of logs.

2. Add request logging.
   - Log API route requests.
   - Log server action failures where useful.
   - Log sports sync runs.
   - Log auth/security-relevant events without exposing credentials.

3. Add Loki and Grafana Alloy.
   - Add Loki service to monitoring Compose.
   - Add Alloy config to collect Docker logs.
   - Label logs by service, container and environment.
   - Add Grafana datasource for Loki.

4. Create log dashboards.
   - Error logs by service.
   - Slow request logs.
   - Auth failure logs.
   - Sports sync logs.
   - Deployment/restart log view.

Done when:

- Application logs are JSON in production.
- Logs are searchable in Grafana.
- Logs include request IDs.
- A failed request can be found by service, route and time window.

## Phase 3: Application Metrics And Alerting

Goal: detect performance and reliability issues automatically.

1. Add application metrics endpoint.
   - Add `/api/metrics` or a protected internal metrics endpoint.
   - Export Prometheus-compatible metrics.
   - Include request count, response duration and error count.
   - Include API route labels with controlled cardinality.

2. Add business-critical metrics.
   - Article views/events accepted.
   - Failed article engagement writes.
   - Sports sync success/failure.
   - Sports sync duration.
   - Match data freshness.
   - Auth login failures.
   - Comment submissions and moderation backlog.
   - Poll votes accepted.

3. Add database monitoring.
   - Track connection health.
   - Track query latency where feasible.
   - Track slow query logs at the database provider if available.
   - Add dashboard panels for DB availability and latency.

4. Add application dashboards.
   - Requests per minute.
   - Error rate.
   - P50/P95/P99 response time.
   - Slow API routes.
   - Failed background jobs.
   - Match data freshness.

5. Add actionable alerts.
   - API error rate above threshold.
   - P95 latency above threshold.
   - Database unavailable.
   - Sports sync failing repeatedly.
   - Match data stale.
   - Auth failures spike.
   - Comment moderation backlog too high.

Done when:

- Grafana can show application request and error trends.
- Alerts fire for simulated failure conditions.
- The team can identify whether an issue is app, database, sync worker or infrastructure.

## Phase 4: Incident Workflow

Goal: make production incidents repeatable to diagnose and resolve.

1. Create incident runbooks.
   - App unavailable.
   - High latency.
   - Database unavailable.
   - Disk almost full.
   - Sports data sync broken.
   - Authentication/login failure spike.
   - Netlify/VPS deployment failure.

2. Define alert ownership.
   - Primary responder.
   - Escalation path.
   - Notification channel.
   - Expected response time.

3. Add deployment markers.
   - Send deployment releases to Sentry.
   - Add Grafana annotations for deployments if possible.
   - Include git SHA/version in app health output.

4. Add operational checklist.
   - How to check app health.
   - How to inspect logs by request ID.
   - How to inspect container metrics.
   - How to restart only the affected service.
   - How to rollback a deployment.

Done when:

- A responder can move from alert to dashboard to logs to likely root cause.
- Deployment changes are visible in Sentry/Grafana.
- Runbooks exist for the common failure modes.

## Phase 5: Distributed Tracing

Goal: understand request flow and bottlenecks once the system has more services, workers or provider integrations.

1. Add OpenTelemetry.
   - Configure service name and environment.
   - Instrument Next.js request handling where supported.
   - Instrument database calls where feasible.
   - Instrument external provider calls.

2. Add Tempo.
   - Add Tempo to monitoring Compose.
   - Add Grafana datasource.
   - Connect traces with logs using request IDs/trace IDs.

3. Add tracing dashboards.
   - Slow traces.
   - Error traces.
   - External provider latency.
   - Background job traces.

Done when:

- A slow or failed request can be followed through app, database and external services.
- Logs and traces can be correlated from Grafana.

## Phase 6: Production Hardening

Goal: keep the monitoring system reliable, secure and maintainable.

1. Secure monitoring access.
   - Put Grafana, Prometheus, Loki and cAdvisor behind private networking, VPN or reverse-proxy auth.
   - Do not expose Prometheus/cAdvisor publicly.
   - Use strong Grafana admin password.

2. Add retention and storage policy.
   - Define metrics retention.
   - Define log retention.
   - Estimate disk usage.
   - Add alerts for monitoring disk usage.

3. Back up monitoring configuration.
   - Version Grafana dashboards where possible.
   - Version Prometheus, Loki and Alloy config.
   - Keep Compose files in the repo.

4. Review cost and noise.
   - Tune Sentry sampling.
   - Tune alert thresholds.
   - Remove noisy/non-actionable alerts.

Done when:

- Monitoring data retention is known.
- Monitoring services are not publicly exposed.
- Dashboards/configs are reproducible.
- Alerts are actionable and low-noise.

## Recommended Repository Changes

Add or update:

- `src/app/api/health/route.ts`
- request ID middleware or helper
- shared logger in `src/lib/logger.ts`
- app instrumentation/config for Sentry
- optional metrics route/helper
- `monitoring/docker-compose.monitoring.yml`
- `monitoring/prometheus/prometheus.yml`
- `monitoring/alloy/config.alloy`
- `monitoring/loki/loki.yml`
- `monitoring/grafana/dashboards/`
- `monitoring/grafana/provisioning/`
- `docs/monitoring-runbooks.md`
- `.env.example` monitoring variables

## Suggested Build Order

1. Health endpoint and request IDs.
2. Sentry.
3. Uptime monitor.
4. Prometheus, Node Exporter, cAdvisor and Grafana.
5. Pino structured logging.
6. Loki and Alloy.
7. Application metrics endpoint and dashboards.
8. Alerts and notification channels.
9. Incident runbooks.
10. OpenTelemetry and Tempo later.

## Decisions Still Needed

- Use self-hosted Uptime Kuma or a managed external uptime monitor.
- Alert channel for MVP: email, Slack or both.
- Whether Grafana should be VPS-only, VPN-only or protected by reverse-proxy auth.
- Metrics endpoint access strategy: private network only, bearer token, or reverse-proxy allowlist.
- Log retention period.
- Sentry plan and sampling level.
- Whether production database metrics will come from Neon dashboards, app-level metrics, or an exporter.

## Phase 1 MVP Acceptance Checklist

- `/api/health` returns healthy status in production.
- Sentry captures frontend and backend test errors.
- Uptime monitor checks homepage and `/api/health`.
- Grafana shows CPU, memory, disk, network and container metrics.
- Alerts notify the chosen channel.
- Monitoring setup is documented enough to recreate on a new VPS.
