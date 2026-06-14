// CLAUDE.md §17 — env validated at boot via Zod; app refuses to start on bad config.
// MM-010 / ADR-0001 fallback adds JWT_SECRET (or RS256 keypair) for local auth.
// MM-016 + MM-017 add Sentry + PostHog: optional in dev, required in staging+prod
// (per session decision — strict-once-deployed, lenient-while-iterating).

import { z } from 'zod';

// dotenv sets unset vars to "" — coerce to undefined so .url().optional() works correctly.
const optionalUrl = z.preprocess((v) => (v === '' ? undefined : v), z.string().url().optional());

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),

    DATABASE_URL: z.string().url(),

    // Optional in MM-003; required from MM-021 (BullMQ + pub/sub).
    REDIS_URL: z.string().url().optional(),

    // ADR-0001 fallback auth — MM-010.
    JWT_SECRET: z.string().min(32).optional(),
    JWT_PRIVATE_KEY: z.string().optional(),
    JWT_PUBLIC_KEY: z.string().optional(),
    JWT_ACCESS_TTL: z.string().default('15m'),
    JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),
    JWT_ISSUER: z.string().default('mimir-local'),

    // Heimdal — wired in Sprint 2 swap (MM-S2-AUTH-SWAP). Optional for fallback.
    HEIMDAL_JWKS_URL: optionalUrl,

    // MM-016 — Sentry.
    SENTRY_DSN: optionalUrl,

    // MM-017 — PostHog.
    POSTHOG_KEY: z.string().optional(),
    POSTHOG_HOST: z.string().url().default('https://us.i.posthog.com'),

    // AI — MM-032 (Anthropic Haiku for stock insights).
    ANTHROPIC_API_KEY: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    // ADR-0001: HS256 (JWT_SECRET) OR RS256 (JWT_PRIVATE_KEY+JWT_PUBLIC_KEY).
    const hasHs = !!env.JWT_SECRET;
    const hasRs = !!env.JWT_PRIVATE_KEY && !!env.JWT_PUBLIC_KEY;
    if (!hasHs && !hasRs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Configure JWT_SECRET (HS256) or JWT_PRIVATE_KEY+JWT_PUBLIC_KEY (RS256) for ADR-0001 auth.',
      });
    }

    // Strict telemetry in staging+prod, lenient in dev/test.
    if (env.NODE_ENV === 'staging' || env.NODE_ENV === 'production') {
      if (!env.SENTRY_DSN) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['SENTRY_DSN'],
          message: 'SENTRY_DSN is required in staging + production (MM-016).',
        });
      }
      if (!env.POSTHOG_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['POSTHOG_KEY'],
          message: 'POSTHOG_KEY is required in staging + production (MM-017).',
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;
