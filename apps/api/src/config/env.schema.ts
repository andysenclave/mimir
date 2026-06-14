// CLAUDE.md §17 — env validated at boot via Zod; app refuses to start on bad config.
// MM-010 / ADR-0001 fallback adds JWT_SECRET (or RS256 keypair) for local auth.

import { z } from 'zod';

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),

    DATABASE_URL: z.string().url(),

    // Optional in MM-003; required from MM-021 (BullMQ + pub/sub).
    REDIS_URL: z.string().url().optional(),

    // ADR-0001 fallback auth — MM-010.
    // HS256 (JWT_SECRET) for dev convenience; RS256 keypair for staging/prod.
    JWT_SECRET: z.string().min(32).optional(),
    JWT_PRIVATE_KEY: z.string().optional(),
    JWT_PUBLIC_KEY: z.string().optional(),
    JWT_ACCESS_TTL: z.string().default('15m'),
    JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),
    JWT_ISSUER: z.string().default('mimir-local'),

    // Heimdal — wired in Sprint 2 swap (MM-S2-AUTH-SWAP). Optional for fallback.
    HEIMDAL_JWKS_URL: z.string().url().optional(),

    // Observability — MM-016, MM-017.
    SENTRY_DSN: z.string().url().optional(),
    POSTHOG_KEY: z.string().optional(),

    // AI — MM-032 (Anthropic Haiku for stock insights).
    ANTHROPIC_API_KEY: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    // Either JWT_SECRET (HS256) or both JWT_PRIVATE_KEY + JWT_PUBLIC_KEY (RS256)
    // must be configured for ADR-0001 fallback auth to function.
    const hasHs = !!env.JWT_SECRET;
    const hasRs = !!env.JWT_PRIVATE_KEY && !!env.JWT_PUBLIC_KEY;
    if (!hasHs && !hasRs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Configure JWT_SECRET (HS256) or JWT_PRIVATE_KEY+JWT_PUBLIC_KEY (RS256) for ADR-0001 auth.',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;
