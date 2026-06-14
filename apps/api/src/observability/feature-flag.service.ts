// MM-017 — feature-flag refresher. Hits PostHog every 5 min, persists the
// payload to FeatureFlagCache so resolvers can read flags without a network
// hop on every request. Read path is sync via the cache.

import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { PostHogService } from './posthog.service';

const REFRESH_INTERVAL_MS = 5 * 60 * 1_000; // 5 minutes
const SERVER_DISTINCT_ID = 'mimir-server'; // shared identity for server-side flag fetches

@Injectable()
export class FeatureFlagService implements OnModuleInit {
  private readonly logger = new Logger(FeatureFlagService.name);
  // @ts-expect-error NodeJS.Timeout is the correct type for setInterval, but the types are messed up in NestJS projects for some reason.
  private timerRef: NodeJS.Timeout | null = null;
  private cache: Record<string, boolean | string> = {};

  constructor(
    private readonly prisma: PrismaService,
    private readonly posthog: PostHogService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.refreshFromCacheTable();
    this.timerRef = setInterval(() => void this.refreshFromPostHog(), REFRESH_INTERVAL_MS);
    void this.refreshFromPostHog();
  }

  isEnabled(flagKey: string): boolean {
    const value = this.cache[flagKey];
    return value === true || value === 'true';
  }

  variant(flagKey: string): string | undefined {
    const value = this.cache[flagKey];
    if (typeof value === 'string') return value;
    return undefined;
  }

  private async refreshFromCacheTable(): Promise<void> {
    const rows = await this.prisma.featureFlagCache.findMany();
    for (const row of rows) {
      this.cache[row.flagKey] = row.payload as boolean | string;
    }
    this.logger.debug(`flag cache hydrated from db (${rows.length} entries)`);
  }

  private async refreshFromPostHog(): Promise<void> {
    try {
      const flags = await this.posthog.getAllFlags(SERVER_DISTINCT_ID);
      this.cache = flags;
      // Persist so a fresh boot has flags before the first PostHog round-trip.
      await Promise.all(
        Object.entries(flags).map(([flagKey, payload]) =>
          this.prisma.featureFlagCache.upsert({
            where: { flagKey },
            update: { payload, refreshedAt: new Date() },
            create: { flagKey, payload, refreshedAt: new Date() },
          }),
        ),
      );
    } catch (err) {
      this.logger.warn(`flag refresh failed: ${(err as Error).message}`);
    }
  }
}
