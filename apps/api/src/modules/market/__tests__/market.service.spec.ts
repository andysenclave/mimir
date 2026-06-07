// Unit tests for MarketService — MM-021.
// Prompt 08 (how-to-unit-test-a-service.md): mock all deps, each test = one behaviour.

import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { PrismaService } from '../../../prisma/prisma.service';
import { MarketService, REDIS_PUBLISHER, type RedisPublisher, type PollResult } from '../market.service';
import { MarketDataProvider, type StockQuote } from '../providers/market-data-provider.interface';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeQuote(symbol: string, ltp: number): StockQuote {
  return { symbol, ltp, open: ltp, high: ltp, low: ltp, close: ltp, change: 0, changePct: 0, fetchedAt: new Date() };
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
  },
};

const mockProvider: jest.Mocked<MarketDataProvider> = {
  getQuote: jest.fn(),
  getQuotes: jest.fn(),
  getMarketOverview: jest.fn(),
  getIndexQuote: jest.fn(),
};

const mockRedis: jest.Mocked<RedisPublisher> = {
  publish: jest.fn().mockResolvedValue(1),
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('MarketService', () => {
  let service: MarketService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Suppress logger noise in test output.
    jest.spyOn(Logger.prototype, 'log').mockReturnValue(undefined);
    jest.spyOn(Logger.prototype, 'debug').mockReturnValue(undefined);
    jest.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);

    const module = await Test.createTestingModule({
      providers: [
        MarketService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MarketDataProvider, useValue: mockProvider },
        { provide: REDIS_PUBLISHER, useValue: mockRedis },
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
      expect(mockRedis.publish).not.toHaveBeenCalled();
      expect(mockPrisma.marketSnapshot.upsert).not.toHaveBeenCalled();
    });
  });

  // ─── Happy path ────────────────────────────────────────────────────────────

  describe('pollAndPublish — market open, fresh tick', () => {
    it('publishes to Redis and upserts MarketSnapshot', async () => {
      const quote = makeQuote('RELIANCE', 2840.50);
      mockProvider.getQuote.mockResolvedValueOnce(quote);

      const result = await service.pollAndPublish(['RELIANCE'], marketOpen());

      expect(result).toEqual<PollResult>({ published: 1, skipped: 0, failed: 0 });
      expect(mockRedis.publish).toHaveBeenCalledWith(
        'stock:RELIANCE',
        expect.stringContaining('"symbol":"RELIANCE"'),
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
      expect(mockRedis.publish).toHaveBeenCalledTimes(2);
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
        .mockResolvedValueOnce(makeQuote('RELIANCE', ltp)); // identical

      await service.pollAndPublish(['RELIANCE'], now);
      const result = await service.pollAndPublish(['RELIANCE'], now); // same minute

      expect(result).toEqual<PollResult>({ published: 0, skipped: 1, failed: 0 });
      // Redis published only on the first call.
      expect(mockRedis.publish).toHaveBeenCalledTimes(1);
    });

    it('publishes again when LTP changes even within the same minute', async () => {
      const now = marketOpen();
      mockProvider.getQuote
        .mockResolvedValueOnce(makeQuote('RELIANCE', 2840))
        .mockResolvedValueOnce(makeQuote('RELIANCE', 2845)); // different LTP

      await service.pollAndPublish(['RELIANCE'], now);
      const result = await service.pollAndPublish(['RELIANCE'], now);

      expect(result).toEqual<PollResult>({ published: 1, skipped: 0, failed: 0 });
      expect(mockRedis.publish).toHaveBeenCalledTimes(2);
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
      // RELIANCE failed, TCS succeeded.
      expect(mockRedis.publish).toHaveBeenCalledTimes(1);
      expect(mockRedis.publish).toHaveBeenCalledWith(
        'stock:TCS',
        expect.stringContaining('"symbol":"TCS"'),
      );
    });

    it('returns all failed when every provider call rejects', async () => {
      mockProvider.getQuote.mockRejectedValue(new Error('provider down'));

      const result = await service.pollAndPublish(['RELIANCE', 'TCS'], marketOpen());

      expect(result).toEqual<PollResult>({ published: 0, skipped: 0, failed: 2 });
      expect(mockRedis.publish).not.toHaveBeenCalled();
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
});
