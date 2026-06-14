// MM-016 + MM-017 — Observability bundle. Sentry init happens in main.ts BEFORE
// NestFactory.create, so this module only wires PostHog + feature flags + the
// global Sentry interceptor.

import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { FeatureFlagService } from './feature-flag.service';
import { PostHogService } from './posthog.service';
import { SentryInterceptor } from './sentry.interceptor';

@Global()
@Module({
  providers: [
    PostHogService,
    FeatureFlagService,
    { provide: APP_INTERCEPTOR, useClass: SentryInterceptor },
  ],
  exports: [PostHogService, FeatureFlagService],
})
export class ObservabilityModule {}
