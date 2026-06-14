// MarketService — domain logic for market data polling and persistence.
// Prompt 14 (how-to-structure-a-service-method.md): business logic lives here, not in the resolver.
// MM-021: pollAndPublish + snapshot upsert.
// MM-023: publishTick now uses RedisPubSub (PUB_SUB token); getMarketOverview with TTL cache.

import { isMarketOpen, TOP_100_NSE_SYMBOLS } from '@mimir/shared';
import { Inject, Injectable, Logger } from '@nestjs/common';


import { PrismaService } from '../../prisma/prisma.service';
import { PUB_SUB } from '../../pubsub/pubsub.module';

import { IntradayPointGql } from './entities/intraday-point.entity';
import { StockQuoteGql } from './entities/stock-quote.entity';
import { MarketDataProvider, type MarketOverview, type StockQuote } from './providers/market-data-provider.interface';

import type { RedisPubSub } from 'graphql-redis-subscriptions';

export interface PollResult {
  published: number;
  skipped: number;
  failed: number;
}

// Channel name that MarketResolver subscribes to for stock ticks.
export const STOCK_TICK_CHANNEL = 'stock:any';

// Simple in-process TTL cache entry.
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);

  // In-process dedup: track last-published LTP per symbol to avoid spamming identical ticks.
  // Key: symbol, Value: { ltp, minuteKey }. Resets on process restart (acceptable).
  private readonly lastPublished = new Map<string, { ltp: number; minuteKey: number }>();

  // Simple TTL cache for marketOverview (30s market hours, 5min off-hours).
  private overviewCache: CacheEntry<MarketOverview> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly provider: MarketDataProvider,
    @Inject(PUB_SUB) private readonly pubSub: RedisPubSub,
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

  /**
   * Search the tradeable NSE universe (TOP_100_NSE_SYMBOLS) by symbol substring.
   * Restricting to that curated set guarantees every result opens its invest/
   * order screen. Results are enriched with last-known prices from MarketSnapshot
   * where available (symbols without a snapshot still return so they're findable —
   * the invest screen fetches fresh data on open). Capped at 20.
   */
  async searchStocks(query: string): Promise<StockQuoteGql[]> {
    const q = query.trim().toUpperCase();
    if (q.length === 0) return [];

    const matches = TOP_100_NSE_SYMBOLS.filter((s) => s.includes(q)).slice(0, 20);
    if (matches.length === 0) return [];

    const snapshots = await this.prisma.marketSnapshot.findMany({
      where: { symbol: { in: matches } },
    });
    const snapBySymbol = new Map(snapshots.map((r) => [r.symbol, r]));

    return matches.map((symbol) => {
      const row = snapBySymbol.get(symbol);
      if (!row) return { symbol, ltp: 0, fetchedAt: new Date() };
      return {
        symbol: row.symbol,
        ltp: row.ltp.toNumber(),
        change: row.change?.toNumber(),
        changePct: row.changePct?.toNumber(),
        open: row.open?.toNumber(),
        high: row.high?.toNumber(),
        low: row.low?.toNumber(),
        close: row.close?.toNumber(),
        volume: row.volume !== null && row.volume !== undefined ? Number(row.volume) : undefined,
        fetchedAt: row.fetchedAt,
      };
    });
  }

  /** Retrieve the last-known snapshot for a symbol, mapped to GraphQL entity. */
  async getStockQuote(symbol: string): Promise<StockQuoteGql | null> {
    const row = await this.prisma.marketSnapshot.findUnique({ where: { symbol } });
    if (!row) return null;
    return {
      symbol: row.symbol,
      ltp: row.ltp.toNumber(),
      change: row.change?.toNumber(),
      changePct: row.changePct?.toNumber(),
      open: row.open?.toNumber(),
      high: row.high?.toNumber(),
      low: row.low?.toNumber(),
      close: row.close?.toNumber(),
      volume: row.volume !== null && row.volume !== undefined ? Number(row.volume) : undefined,
      fetchedAt: row.fetchedAt,
    };
  }

  /**
   * Intraday price series for a symbol (1-day, ~5-min intervals).
   * Returns [] when market is closed or data unavailable — mobile hides chart gracefully.
   */
  async getStockIntraday(symbol: string): Promise<IntradayPointGql[]> {
    return this.provider.getIntradayData(symbol);
  }

  /** @internal Used by unit tests for snapshot existence check. */
  async getSnapshot(symbol: string) {
    return this.prisma.marketSnapshot.findUnique({ where: { symbol } });
  }

  /**
   * Returns market overview (indices + sectors + top movers).
   * Cached in-process: 30s during market hours, 5min off-hours.
   *
   * Indices + sectors come from the provider's single getAllIndices() call.
   * Top movers come from MarketSnapshot (real, tradeable NSE equities) — the
   * provider only has index rows, whose "symbols" are index names that can't be
   * traded. Sourcing movers from the polled snapshot guarantees every mover row
   * opens its invest/order screen (getStockQuote + order validation both resolve).
   */
  async getMarketOverview(now: Date = new Date()): Promise<MarketOverview> {
    const ttlMs = isMarketOpen(now) ? 30_000 : 300_000;
    if (this.overviewCache && this.overviewCache.expiresAt > now.getTime()) {
      return this.overviewCache.data;
    }

    const [base, movers] = await Promise.all([
      this.provider.getMarketOverview(),
      this.getTopMoversFromSnapshots(),
    ]);

    const data: MarketOverview = {
      ...base,
      topGainers: movers.topGainers,
      topLosers: movers.topLosers,
    };
    this.overviewCache = { data, expiresAt: now.getTime() + ttlMs };
    return data;
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  /**
   * Top 5 gainers + top 5 losers from the polled MarketSnapshot, restricted to
   * the curated tradeable universe (TOP_100_NSE_SYMBOLS). Every returned symbol
   * is guaranteed quotable and order-placeable. Zero extra API calls — reads the
   * snapshot the poller already maintains (holds last close-of-day off-hours).
   */
  private async getTopMoversFromSnapshots(): Promise<{
    topGainers: StockQuote[];
    topLosers: StockQuote[];
  }> {
    const rows = await this.prisma.marketSnapshot.findMany({
      where: { symbol: { in: [...TOP_100_NSE_SYMBOLS] }, changePct: { not: null } },
    });

    const quotes: StockQuote[] = rows.map((r) => ({
      symbol: r.symbol,
      ltp: r.ltp.toNumber(),
      change: r.change?.toNumber() ?? 0,
      changePct: r.changePct?.toNumber() ?? 0,
      fetchedAt: r.fetchedAt,
    }));

    const byPctDesc = (a: StockQuote, b: StockQuote): number =>
      (b.changePct ?? 0) - (a.changePct ?? 0);

    const topGainers = quotes
      .filter((q) => (q.changePct ?? 0) > 0)
      .sort(byPctDesc)
      .slice(0, 5);

    const topLosers = quotes
      .filter((q) => (q.changePct ?? 0) < 0)
      .sort((a, b) => -byPctDesc(a, b))
      .slice(0, 5);

    return { topGainers, topLosers };
  }

  private async publishTick(_symbol: string, quote: StockQuote): Promise<void> {
    await this.pubSub.publish(STOCK_TICK_CHANNEL, {
      stockPrice: {
        symbol: quote.symbol,
        ltp: quote.ltp,
        change: quote.change ?? 0,
        changePct: quote.changePct ?? 0,
        fetchedAt: quote.fetchedAt.toISOString(),
      },
    });
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
