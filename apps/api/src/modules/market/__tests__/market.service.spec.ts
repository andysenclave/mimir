// Unit tests for MarketService — MM-021 / MM-023.
// MM-023: REDIS_PUBLISHER replaced by PUB_SUB (RedisPubSub); publish assertions updated.
// Prompt 08 (how-to-unit-test-a-service.md): mock all deps, each test = one behaviour.

import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { PUB_SUB } from '../../../pubsub/pubsub.module';
import { MarketService, STOCK_TICK_CHANNEL, type PollResult } from '../market.service';
import { MarketDataProvider, type MarketOverview, type StockQuote } from '../providers/market-data-provider.interface';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeQuote(symbol: string, ltp: number): StockQuote {
  return { symbol, ltp, open: ltp, high: ltp, low: ltp, close: ltp, change: 0, changePct: 0, fetchedAt: new Date() };
}

/** A MarketSnapshot row as Prisma returns it — Decimal-typed numeric fields. */
function makeSnapshotRow(symbol: string, changePct: number) {
  return {
    symbol,
    ltp: new Prisma.Decimal(1000),
    change: new Prisma.Decimal(changePct * 10),
    changePct: new Prisma.Decimal(changePct),
    fetchedAt: new Date(),
  };
}

function makeOverview(): MarketOverview {
  return {
    indices: [{ symbol: '^NSEI', name: 'NIFTY 50', ltp: 22000, change: 100, changePct: 0.45, fetchedAt: new Date() }],
    globalIndices: [],
    topGainers: [makeQuote('RELIANCE', 2840)],
    topLosers: [makeQuote('TCS', 3920)],
    sectors: [{ name: 'NIFTY IT', displayName: 'IT', changePct: -0.5 }],
    fetchedAt: new Date(),
  };
}

/** Returns a Date that falls during NSE market hours (Mon–Fri, 10:00 IST). */
function marketOpen(): Date {
  // 2026-05-25 is a Monday. 10:00 IST = 04:30 UTC.
  return new Date('2026-05-25T04:30:00.000Z');
}

/** Returns a Date clearly outside NSE market hours (Sunday). */
function marketClosed(): Date {
  return new Date('2026-05-24T04:30:00.000Z'); // Sunday
}

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPrisma = {
  marketSnapshot: {
    upsert: jest.fn().mockResolvedValue({}),
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
  },
};

const mockProvider: jest.Mocked<MarketDataProvider> = {
  getQuote: jest.fn(),
  getQuotes: jest.fn(),
  getMarketOverview: jest.fn(),
  getIndexQuote: jest.fn(),
  getIntradayData: jest.fn(),
  getGlobalIndices: jest.fn().mockResolvedValue([]),
};

const mockPubSub = {
  publish: jest.fn().mockResolvedValue(undefined),
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('MarketService', () => {
  let service: MarketService;

  beforeEach(async () => {
    jest.clearAllMocks();

    jest.spyOn(Logger.prototype, 'log').mockReturnValue(undefined);
    jest.spyOn(Logger.prototype, 'debug').mockReturnValue(undefined);
    jest.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);

    const module = await Test.createTestingModule({
      providers: [
        MarketService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MarketDataProvider, useValue: mockProvider },
        { provide: PUB_SUB, useValue: mockPubSub },
      ],
    }).compile();

    service = module.get(MarketService);
  });

  // ─── Market-hours gate ────────────────────────────────────────────────────

  describe('pollAndPublish — market closed', () => {
    it('returns zero counts and does not call provider', async () => {
      const result = await service.pollAndPublish(['RELIANCE'], marketClosed());

      expect(result).toEqual<PollResult>({ published: 0, skipped: 0, failed: 0 });
      expect(mockProvider.getQuote).not.toHaveBeenCalled();
      expect(mockPubSub.publish).not.toHaveBeenCalled();
      expect(mockPrisma.marketSnapshot.upsert).not.toHaveBeenCalled();
    });
  });

  // ─── Happy path ────────────────────────────────────────────────────────────

  describe('pollAndPublish — market open, fresh tick', () => {
    it('publishes to Redis PubSub and upserts MarketSnapshot', async () => {
      const quote = makeQuote('RELIANCE', 2840.50);
      mockProvider.getQuote.mockResolvedValueOnce(quote);

      const result = await service.pollAndPublish(['RELIANCE'], marketOpen());

      expect(result).toEqual<PollResult>({ published: 1, skipped: 0, failed: 0 });
      expect(mockPubSub.publish).toHaveBeenCalledWith(
        STOCK_TICK_CHANNEL,
        expect.objectContaining({ stockPrice: expect.objectContaining({ symbol: 'RELIANCE', ltp: 2840.50 }) }),
      );
      expect(mockPrisma.marketSnapshot.upsert).toHaveBeenCalledTimes(1);
      expect(mockPrisma.marketSnapshot.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { symbol: 'RELIANCE' },
          create: expect.objectContaining({ symbol: 'RELIANCE', ltp: 2840.50 }),
          update: expect.objectContaining({ ltp: 2840.50 }),
        }),
      );
    });

    it('publishes each symbol independently when multiple symbols given', async () => {
      mockProvider.getQuote
        .mockResolvedValueOnce(makeQuote('RELIANCE', 2840))
        .mockResolvedValueOnce(makeQuote('TCS', 3920));

      const result = await service.pollAndPublish(['RELIANCE', 'TCS'], marketOpen());

      expect(result).toEqual<PollResult>({ published: 2, skipped: 0, failed: 0 });
      expect(mockPubSub.publish).toHaveBeenCalledTimes(2);
      expect(mockPrisma.marketSnapshot.upsert).toHaveBeenCalledTimes(2);
    });
  });

  // ─── Dedup ─────────────────────────────────────────────────────────────────

  describe('pollAndPublish — dedup', () => {
    it('skips publish when LTP is identical within the same minute', async () => {
      const ltp = 2840.50;
      const now = marketOpen();
      mockProvider.getQuote
        .mockResolvedValueOnce(makeQuote('RELIANCE', ltp))
        .mockResolvedValueOnce(makeQuote('RELIANCE', ltp));

      await service.pollAndPublish(['RELIANCE'], now);
      const result = await service.pollAndPublish(['RELIANCE'], now);

      expect(result).toEqual<PollResult>({ published: 0, skipped: 1, failed: 0 });
      expect(mockPubSub.publish).toHaveBeenCalledTimes(1);
    });

    it('publishes again when LTP changes even within the same minute', async () => {
      const now = marketOpen();
      mockProvider.getQuote
        .mockResolvedValueOnce(makeQuote('RELIANCE', 2840))
        .mockResolvedValueOnce(makeQuote('RELIANCE', 2845));

      await service.pollAndPublish(['RELIANCE'], now);
      const result = await service.pollAndPublish(['RELIANCE'], now);

      expect(result).toEqual<PollResult>({ published: 1, skipped: 0, failed: 0 });
      expect(mockPubSub.publish).toHaveBeenCalledTimes(2);
    });
  });

  // ─── Provider failure ─────────────────────────────────────────────────────

  describe('pollAndPublish — provider failure', () => {
    it('counts failed symbol and continues with remaining symbols', async () => {
      mockProvider.getQuote
        .mockRejectedValueOnce(new Error('NSE timeout'))
        .mockResolvedValueOnce(makeQuote('TCS', 3920));

      const result = await service.pollAndPublish(['RELIANCE', 'TCS'], marketOpen());

      expect(result).toEqual<PollResult>({ published: 1, skipped: 0, failed: 1 });
      expect(mockPubSub.publish).toHaveBeenCalledTimes(1);
      expect(mockPubSub.publish).toHaveBeenCalledWith(
        STOCK_TICK_CHANNEL,
        expect.objectContaining({ stockPrice: expect.objectContaining({ symbol: 'TCS' }) }),
      );
    });

    it('returns all failed when every provider call rejects', async () => {
      mockProvider.getQuote.mockRejectedValue(new Error('provider down'));

      const result = await service.pollAndPublish(['RELIANCE', 'TCS'], marketOpen());

      expect(result).toEqual<PollResult>({ published: 0, skipped: 0, failed: 2 });
      expect(mockPubSub.publish).not.toHaveBeenCalled();
      expect(mockPrisma.marketSnapshot.upsert).not.toHaveBeenCalled();
    });
  });

  // ─── getSnapshot ──────────────────────────────────────────────────────────

  describe('getSnapshot', () => {
    it('returns null when no snapshot exists', async () => {
      mockPrisma.marketSnapshot.findUnique.mockResolvedValueOnce(null);
      const result = await service.getSnapshot('RELIANCE');
      expect(result).toBeNull();
    });

    it('returns the snapshot row when it exists', async () => {
      const snapshot = { symbol: 'RELIANCE', ltp: 2840, updatedAt: new Date(), fetchedAt: new Date() };
      mockPrisma.marketSnapshot.findUnique.mockResolvedValueOnce(snapshot);
      const result = await service.getSnapshot('RELIANCE');
      expect(result).toEqual(snapshot);
    });
  });

  // ─── getMarketOverview ────────────────────────────────────────────────────

  describe('getMarketOverview', () => {
    it('takes indices + sectors from the provider but movers from MarketSnapshot', async () => {
      const overview = makeOverview();
      mockProvider.getMarketOverview.mockResolvedValueOnce(overview);
      // Snapshot holds real, tradeable equities (mix of up + down).
      mockPrisma.marketSnapshot.findMany.mockResolvedValueOnce([
        makeSnapshotRow('RELIANCE', 5.2),
        makeSnapshotRow('TCS', 3.1),
        makeSnapshotRow('INFY', -2.4),
        makeSnapshotRow('WIPRO', -4.8),
      ]);

      const result = await service.getMarketOverview(marketOpen());

      // Indices + sectors are passed through from the provider.
      expect(result.indices).toEqual(overview.indices);
      expect(result.sectors).toEqual(overview.sectors);
      // Movers are the snapshot equities, NOT the provider's index rows.
      expect(result.topGainers.map((q) => q.symbol)).toEqual(['RELIANCE', 'TCS']);
      expect(result.topLosers.map((q) => q.symbol)).toEqual(['WIPRO', 'INFY']);
      expect(mockProvider.getMarketOverview).toHaveBeenCalledTimes(1);
    });

    it('only surfaces tradeable symbols (restricted to TOP_100 universe)', async () => {
      mockProvider.getMarketOverview.mockResolvedValueOnce(makeOverview());
      mockPrisma.marketSnapshot.findMany.mockResolvedValueOnce([makeSnapshotRow('RELIANCE', 2.0)]);

      const result = await service.getMarketOverview(marketOpen());

      // The findMany query is scoped to the curated tradeable universe.
      const whereArg = mockPrisma.marketSnapshot.findMany.mock.calls[0]?.[0] as {
        where: { symbol: { in: string[] } };
      };
      expect(whereArg.where.symbol.in).toContain('RELIANCE');
      expect(result.topGainers[0]?.symbol).toBe('RELIANCE');
    });

    it('returns cached data on second call within TTL', async () => {
      const overview = makeOverview();
      mockProvider.getMarketOverview.mockResolvedValue(overview);
      const now = marketOpen();

      await service.getMarketOverview(now);
      await service.getMarketOverview(now);

      expect(mockProvider.getMarketOverview).toHaveBeenCalledTimes(1);
    });

    it('re-fetches after cache expires', async () => {
      const overview = makeOverview();
      mockProvider.getMarketOverview.mockResolvedValue(overview);
      const now = marketOpen();
      // First fetch
      await service.getMarketOverview(now);
      // Simulate time 31s ahead (past 30s TTL during market hours)
      const later = new Date(now.getTime() + 31_000);
      await service.getMarketOverview(later);

      expect(mockProvider.getMarketOverview).toHaveBeenCalledTimes(2);
    });
  });

  // ─── searchStocks ──────────────────────────────────────────────────────────

  describe('searchStocks', () => {
    it('matches tradeable symbols by substring and enriches with snapshot price', async () => {
      mockPrisma.marketSnapshot.findMany.mockResolvedValueOnce([makeSnapshotRow('RELIANCE', 1.5)]);

      const result = await service.searchStocks('reli');

      expect(result.map((s) => s.symbol)).toContain('RELIANCE');
      const reliance = result.find((s) => s.symbol === 'RELIANCE');
      expect(reliance?.changePct).toBe(1.5);
      // Query is scoped to the matched tradeable symbols only.
      const whereArg = mockPrisma.marketSnapshot.findMany.mock.calls[0]?.[0] as {
        where: { symbol: { in: string[] } };
      };
      expect(whereArg.where.symbol.in).toContain('RELIANCE');
    });

    it('still returns a match with no snapshot (ltp 0) so it stays findable', async () => {
      mockPrisma.marketSnapshot.findMany.mockResolvedValueOnce([]); // no snapshots yet

      const result = await service.searchStocks('RELIANCE');

      const reliance = result.find((s) => s.symbol === 'RELIANCE');
      expect(reliance).toBeDefined();
      expect(reliance?.ltp).toBe(0);
    });

    it('returns [] for an empty/whitespace query without hitting the DB', async () => {
      const result = await service.searchStocks('   ');
      expect(result).toEqual([]);
      expect(mockPrisma.marketSnapshot.findMany).not.toHaveBeenCalled();
    });

    it('returns [] when nothing matches', async () => {
      const result = await service.searchStocks('ZZZNOTAREALTICKER');
      expect(result).toEqual([]);
      expect(mockPrisma.marketSnapshot.findMany).not.toHaveBeenCalled();
    });
  });
});
