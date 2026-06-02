// MarketService — domain logic for market data polling and persistence.
// Prompt 14 (how-to-structure-a-service-method.md): business logic lives here, not in the resolver.
// MM-021: pollAndPublish + snapshot upsert.

import { isMarketOpen } from '@mimir/shared';
import { Inject, Injectable, Logger } from '@nestjs/common';


import { PrismaService } from '../../prisma/prisma.service';

import { MarketDataProvider, type StockQuote } from './providers/market-data-provider.interface';

export const REDIS_PUBLISHER = 'REDIS_PUBLISHER';

// Minimal structural type for the Redis pub/sub publisher.
// Avoids importing IORedis directly (bullmq bundles its own copy → type clash).
export interface RedisPublisher {
  publish(channel: string, message: string): Promise<number>;
}

export interface PollResult {
  published: number;
  skipped: number;
  failed: number;
}

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);

  // In-process dedup: track last-published LTP per symbol to avoid spamming identical ticks.
  // Key: symbol, Value: { ltp, minuteKey }. Resets on process restart (acceptable).
  private readonly lastPublished = new Map<string, { ltp: number; minuteKey: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly provider: MarketDataProvider,
    @Inject(REDIS_PUBLISHER) private readonly redisPublisher: RedisPublisher,
  ) {}

  /**
   * Fetch quotes for the given symbols, publish ticks to Redis pub/sub,
   * and upsert MarketSnapshot rows.
   *
   * Returns early with { published: 0, skipped: 0, failed: 0 } if market is closed.
   */
  async pollAndPublish(symbols: string[], now: Date = new Date()): Promise<PollResult> {
    if (!isMarketOpen(now)) {
      this.logger.debug('Market closed — skipping poll');
      return { published: 0, skipped: 0, failed: 0 };
    }

    const results = await Promise.allSettled(symbols.map((s) => this.provider.getQuote(s)));

    let published = 0;
    let skipped = 0;
    let failed = 0;

    for (const [i, result] of results.entries()) {
      const symbol = symbols[i];
      if (symbol === undefined) continue;

      if (result.status === 'rejected') {
        this.logger.warn(`Quote fetch failed for ${symbol}`, { reason: String((result as PromiseRejectedResult).reason) });
        failed++;
        continue;
      }

      const quote = (result as PromiseFulfilledResult<StockQuote>).value;

      if (this.isDuplicate(symbol, quote.ltp, now)) {
        skipped++;
        continue;
      }

      await Promise.all([
        this.publishTick(symbol, quote),
        this.persistSnapshot(quote),
      ]);

      published++;
    }

    this.logger.log(`Poll complete — published:${published} skipped:${skipped} failed:${failed}`);
    return { published, skipped, failed };
  }

  /** Retrieve the last-known snapshot for a symbol (used by GraphQL query in MM-023). */
  async getSnapshot(symbol: string) {
    return this.prisma.marketSnapshot.findUnique({ where: { symbol } });
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private async publishTick(symbol: string, quote: StockQuote): Promise<void> {
    const payload = JSON.stringify({
      symbol: quote.symbol,
      ltp: quote.ltp,
      change: quote.change,
      changePct: quote.changePct,
      fetchedAt: quote.fetchedAt.toISOString(),
    });
    await this.redisPublisher.publish(`stock:${symbol}`, payload);
  }

  private async persistSnapshot(quote: StockQuote): Promise<void> {
    await this.prisma.marketSnapshot.upsert({
      where: { symbol: quote.symbol },
      create: {
        symbol: quote.symbol,
        ltp: quote.ltp,
        open: quote.open,
        high: quote.high,
        low: quote.low,
        close: quote.close,
        change: quote.change,
        changePct: quote.changePct,
        volume: quote.volume,
        fetchedAt: quote.fetchedAt,
      },
      update: {
        ltp: quote.ltp,
        open: quote.open,
        high: quote.high,
        low: quote.low,
        close: quote.close,
        change: quote.change,
        changePct: quote.changePct,
        volume: quote.volume,
        fetchedAt: quote.fetchedAt,
      },
    });
  }

  /**
   * Dedup check: same symbol, same LTP, same wall-clock minute → skip.
   * Updates the cache on non-duplicate.
   */
  private isDuplicate(symbol: string, ltp: number, now: Date): boolean {
    const minuteKey = Math.floor(now.getTime() / 60_000);
    const last = this.lastPublished.get(symbol);
    if (last !== undefined && last.ltp === ltp && last.minuteKey === minuteKey) {
      return true;
    }
    this.lastPublished.set(symbol, { ltp, minuteKey });
    return false;
  }
}
