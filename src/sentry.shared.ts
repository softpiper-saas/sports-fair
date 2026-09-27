export function sentryEnvironment() {
  return process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development";
}

export function sentryRelease() {
  return process.env.SENTRY_RELEASE || process.env.APP_VERSION;
}

export function sentryEnabled(dsn: string | undefined) {
  return Boolean(dsn);
}
