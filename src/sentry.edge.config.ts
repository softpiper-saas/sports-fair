import * as Sentry from "@sentry/nextjs";
import { sentryEnabled, sentryEnvironment, sentryRelease } from "@/sentry.shared";

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (sentryEnabled(dsn)) {
  Sentry.init({
    dsn,
    environment: sentryEnvironment(),
    release: sentryRelease(),
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.05"),
    sendDefaultPii: false
  });
}
