// MM-017 — PostHog server-side client.
// Used for server-emitted events (notification_dropped, ai_cost_per_day, etc.)
// and for fetching feature flags into FeatureFlagCache.

import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostHog } from 'posthog-node';

import type { Env } from '../config/env.schema';

@Injectable()
export class PostHogService implements OnModuleDestroy {
  private readonly logger = new Logger(PostHogService.name);
  private readonly client: PostHog | null;

  constructor(config: ConfigService<Env, true>) {
    const apiKey = config.get<string | undefined>('POSTHOG_KEY');
    const host = config.get<string | undefined>('POSTHOG_HOST') ?? 'https://us.i.posthog.com';

    if (apiKey === undefined || apiKey.length === 0) {
      this.client = null;
      this.logger.warn('POSTHOG_KEY not set — server analytics disabled');
      return;
    }

    this.client = new PostHog(apiKey, { host, flushAt: 20, flushInterval: 10_000 });
  }

  capture(distinctId: string, event: string, properties?: Record<string, unknown>): void {
    if (this.client === null) return;
    this.client.capture({ distinctId, event, properties });
  }

  async getAllFlags(distinctId: string): Promise<Record<string, boolean | string>> {
    if (this.client === null) return {};
    const flags = await this.client.getAllFlags(distinctId);
    return flags as Record<string, boolean | string>;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client !== null) await this.client.shutdown();
  }
}
