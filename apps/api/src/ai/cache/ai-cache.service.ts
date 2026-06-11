// Cache layer for AI insights: Postgres (durable) + Redis (fast read).
// TTL semantics: 4hr for pre-computed, 24hr for on-demand.
// "stale" reads: return a value even if past TTL (for fallback after validation failure).

import { Injectable, Logger, Inject } from '@nestjs/common';
import Redis from 'ioredis';

import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../redis/redis.module';

export interface CachedInsight {
  symbol: string;
  body: string;
  model: string;
  promptVersion: string;
  generatedAt: Date;
}

const PRECOMPUTE_TTL_SEC = 4 * 3600;   // 4 hours
const ON_DEMAND_TTL_SEC  = 24 * 3600;  // 24 hours

function redisKey(symbol: string): string {
  return `ai:insight:${symbol}`;
}

@Injectable()
export class AICacheService {
  private readonly logger = new Logger(AICacheService.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly prisma: PrismaService,
  ) {}

  async get(symbol: string): Promise<CachedInsight | null> {
    try {
      const raw = await this.redis.get(redisKey(symbol));
      if (raw) {
        return JSON.parse(raw) as CachedInsight;
      }
    } catch (err) {
      this.logger.warn(`Redis read failed for ${symbol}`, err);
    }
    // Redis miss — try Postgres (insight may be valid but evicted from Redis)
    return this.getFromPostgres(symbol, { allowExpired: false });
  }

  /** Returns a stale (past-expiry) value if available — used as last-resort fallback. */
  async getStale(symbol: string): Promise<CachedInsight | null> {
    return this.getFromPostgres(symbol, { allowExpired: true });
  }

  async set(
    symbol: string,
    insight: CachedInsight,
    opts: { precomputed: boolean },
  ): Promise<void> {
    const ttl = opts.precomputed ? PRECOMPUTE_TTL_SEC : ON_DEMAND_TTL_SEC;
    const expiresAt = new Date(Date.now() + ttl * 1000);

    await Promise.all([
      // Redis: fast reads
      this.redis
        .set(redisKey(symbol), JSON.stringify(insight), 'EX', ttl)
        .catch((err) => this.logger.warn(`Redis write failed for ${symbol}`, err)),

      // Postgres: durable + stale-read fallback
      this.prisma.aIInsight.upsert({
        where: { symbol },
        create: {
          symbol,
          body: insight.body,
          promptVersion: insight.promptVersion,
          model: insight.model,
          generatedAt: insight.generatedAt,
          expiresAt,
        },
        update: {
          body: insight.body,
          promptVersion: insight.promptVersion,
          model: insight.model,
          generatedAt: insight.generatedAt,
          expiresAt,
        },
      }),
    ]);
  }

  private async getFromPostgres(
    symbol: string,
    opts: { allowExpired: boolean },
  ): Promise<CachedInsight | null> {
    try {
      const row = await this.prisma.aIInsight.findUnique({ where: { symbol } });
      if (!row) return null;
      if (!opts.allowExpired && row.expiresAt < new Date()) return null;
      return {
        symbol: row.symbol,
        body: row.body,
        model: row.model,
        promptVersion: row.promptVersion,
        generatedAt: row.generatedAt,
      };
    } catch (err) {
      this.logger.warn(`Postgres read failed for ${symbol}`, err);
      return null;
    }
  }
}
