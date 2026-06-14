// MM-016 — Sentry must initialise BEFORE NestFactory.create so it can capture
// bootstrap-time errors. Called from main.ts as the first line of bootstrap().

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { scrubPII } from './sentry.scrubber';

let initialized = false;

export function initSentryEarly(): void {
  if (initialized) return;
  initialized = true;

  const dsn = process.env.SENTRY_DSN;
  const env = process.env.NODE_ENV ?? 'development';
  const release = process.env.npm_package_version ?? 'unknown';

  if (dsn === undefined || dsn.length === 0) {
    if (env === 'development' || env === 'test') {
      console.info('[sentry] SENTRY_DSN not set — disabled (env=' + env + ')');
      return;
    }
    // Staging + prod: env.schema.ts already enforced that DSN is set, so we
    // shouldn't get here. Defensive log just in case.

    console.warn('[sentry] SENTRY_DSN missing in non-dev env — Sentry disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: env,
    release,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: env === 'production' ? 0.2 : 1,
    profilesSampleRate: env === 'production' ? 0.2 : 1,
    // @ts-expect-error Sentry typings are very incomplete, and init accepts this option.
    beforeSend: scrubPII,
  });
}
