import * as Sentry from "@sentry/nextjs";
import { sentryEnabled, sentryEnvironment, sentryRelease } from "@/sentry.shared";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (sentryEnabled(dsn)) {
  Sentry.init({
    dsn,
    environment: sentryEnvironment(),
    release: sentryRelease(),
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? "0.05"),
    replaysOnErrorSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ?? "0"),
    replaysSessionSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? "0"),
    sendDefaultPii: false
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
