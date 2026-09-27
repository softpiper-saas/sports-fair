import "server-only";
import pino from "pino";

const redactPaths = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_API_KEY",
  "SENTRY_AUTH_TOKEN",
  "DISCORD_ALERT_WEBHOOK_URL",
  "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
  "CLOUDFLARE_R2_ACCESS_KEY_ID",
  "RESEND_SMTP_PASSWORD",
  "*.password",
  "*.token",
  "*.secret",
  "*.authorization",
  "*.cookie",
  "headers.authorization",
  "headers.cookie"
];

export const logger = pino({
  base: {
    service: "sportsfair-web",
    environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development",
    version: process.env.APP_VERSION || process.env.SENTRY_RELEASE || "development"
  },
  level: process.env.LOG_LEVEL || "info",
  messageKey: "message",
  redact: {
    paths: redactPaths,
    remove: true
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

export function childLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings);
}
