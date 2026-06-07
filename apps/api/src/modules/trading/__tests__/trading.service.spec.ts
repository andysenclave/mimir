// Unit tests for TradingService.getPortfolioPerformance() — MM-025.
// Prompt 08 (how-to-unit-test-a-service): mock all deps, one behaviour per test.
// AC: "Portfolio return calculation matches manual verification for test data."

import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { PrismaService } from '../../../prisma/prisma.service';
import {
  MarketDataProvider,
  type IndexQuote,
  type StockQuote,
} from '../../market/providers/market-data-provider.interface';
import { TradingService } from '../trading.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeHolding(symbol: string, quantity: number) {
  return { id: `hold_${symbol}`, userId: 'user_1', symbol, quantity };
}

function makeQuote(
  symbol: string,
  ltp: number,
  close: number,
  changePct: number,
): StockQuote {
  return { symbol, ltp, close, change: ltp - close, changePct, fetchedAt: new Date() };
}

function makeIndexQuote(symbol: string, changePct: number): IndexQuote {
  return { symbol, name: symbol, ltp: 22000, change: 100, changePct, fetchedAt: new Date() };
}

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPrisma = {
  holding: {
    findMany: jest.fn(),
  },
};

const mockProvider: jest.Mocked<MarketDataProvider> = {
  getQuote: jest.fn(),
  getQuotes: jest.fn(),
  getMarketOverview: jest.fn(),
  getIndexQuote: jest.fn(),
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('TradingService.getPortfolioPerformance', () => {
  let service: TradingService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);

    const module = await Test.createTestingModule({
      providers: [
        TradingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MarketDataProvider, useValue: mockProvider },
      ],
    }).compile();

    service = module.get(TradingService);
  });

  // ─── No holdings ────────────────────────────────────────────────────────────

  describe('no holdings', () => {
    beforeEach(() => {
      mockPrisma.holding.findMany.mockResolvedValue([]);
      mockProvider.getIndexQuote
        .mockResolvedValueOnce(makeIndexQuote('NIFTY 50', 0.45))
        .mockResolvedValueOnce(makeIndexQuote('^GSPC', 0.20));
    });

    it('returns hasHoldings=false and null portfolioChangePct', async () => {
      const result = await service.getPortfolioPerformance('user_1');

      expect(result.hasHoldings).toBe(false);
      expect(result.portfolioChangePct).toBeNull();
    });

    it('does not call getQuotes when there are no holdings', async () => {
      await service.getPortfolioPerformance('user_1');
      expect(mockProvider.getQuotes).not.toHaveBeenCalled();
    });

    it('returns benchmark data even with no holdings', async () => {
      const result = await service.getPortfolioPerformance('user_1');

      expect(result.niftyChangePct).toBe(0.45);
      expect(result.sp500ChangePct).toBe(0.20);
    });

    it('returns "Add stocks" copy', async () => {
      const result = await service.getPortfolioPerformance('user_1');
      expect(result.copy).toBe('Add stocks to start tracking your performance against the market.');
    });
  });

  // ─── Weighted-average math ───────────────────────────────────────────────────
  //
  // Manual verification (AC requirement):
  //   Holding 1: RELIANCE — 10 shares, prevClose=2800, changePct=+2%
  //   Holding 2: TCS      —  5 shares, prevClose=3900, changePct=+4%
  //
  //   weight_RELIANCE = 10 × 2800 = 28,000
  //   weight_TCS      =  5 × 3900 = 19,500
  //   total_weight    = 47,500
  //
  //   weighted_change = 28,000 × 2 + 19,500 × 4 = 56,000 + 78,000 = 134,000
  //   portfolioChangePct = 134,000 / 47,500 ≈ 2.821%

  describe('weighted-average calculation', () => {
    beforeEach(() => {
      mockPrisma.holding.findMany.mockResolvedValue([
        makeHolding('RELIANCE', 10),
        makeHolding('TCS', 5),
      ]);
      mockProvider.getQuotes.mockResolvedValue([
        makeQuote('RELIANCE', 2856, 2800, 2),
        makeQuote('TCS', 4056, 3900, 4),
      ]);
      mockProvider.getIndexQuote
        .mockResolvedValueOnce(makeIndexQuote('NIFTY 50', 1.0))
        .mockResolvedValueOnce(makeIndexQuote('^GSPC', 0.5));
    });

    it('computes portfolioChangePct as weighted average of stock daily changes', async () => {
      const result = await service.getPortfolioPerformance('user_1');

      // Expected: 134,000 / 47,500 ≈ 2.821052...
      const expected = 134_000 / 47_500;
      expect(result.portfolioChangePct).toBeCloseTo(expected, 5);
    });

    it('returns hasHoldings=true', async () => {
      const result = await service.getPortfolioPerformance('user_1');
      expect(result.hasHoldings).toBe(true);
    });
  });

  // ─── Single holding (edge case) ─────────────────────────────────────────────
  //
  //   Holding: INFY — 20 shares, prevClose=1800, changePct=-1.5%
  //   portfolioChangePct = -1.5% (trivially)

  describe('single holding', () => {
    it('returns the single stock changePct directly (weight normalises to 1)', async () => {
      mockPrisma.holding.findMany.mockResolvedValue([makeHolding('INFY', 20)]);
      mockProvider.getQuotes.mockResolvedValue([makeQuote('INFY', 1773, 1800, -1.5)]);
      mockProvider.getIndexQuote
        .mockResolvedValueOnce(makeIndexQuote('NIFTY 50', 0.3))
        .mockResolvedValueOnce(makeIndexQuote('^GSPC', 0.1));

      const result = await service.getPortfolioPerformance('user_1');

      expect(result.portfolioChangePct).toBeCloseTo(-1.5, 5);
    });
  });

  // ─── Copy templates ──────────────────────────────────────────────────────────

  describe('copy selection', () => {
    function setupHolding(portfolioChangePct: number, niftyChangePct: number, sp500ChangePct: number | null) {
      // Portfolio: 1 share, prevClose=1000, changePct=portfolioChangePct
      mockPrisma.holding.findMany.mockResolvedValue([makeHolding('X', 1)]);
      mockProvider.getQuotes.mockResolvedValue([
        makeQuote('X', 1000 + portfolioChangePct * 10, 1000, portfolioChangePct),
      ]);
      if (sp500ChangePct !== null) {
        mockProvider.getIndexQuote
          .mockResolvedValueOnce(makeIndexQuote('NIFTY 50', niftyChangePct))
          .mockResolvedValueOnce(makeIndexQuote('^GSPC', sp500ChangePct));
      } else {
        mockProvider.getIndexQuote
          .mockResolvedValueOnce(makeIndexQuote('NIFTY 50', niftyChangePct))
          .mockRejectedValueOnce(new Error('Yahoo unavailable'));
      }
    }

    it('returns outperforming-both copy when portfolio beats NIFTY and S&P 500', async () => {
      setupHolding(3.0, 1.0, 0.5);
      const result = await service.getPortfolioPerformance('user_1');
      expect(result.copy).toBe('You are outperforming both benchmarks today.');
    });

    it('returns behind-both copy when portfolio trails NIFTY and S&P 500', async () => {
      setupHolding(0.2, 1.0, 0.5);
      const result = await service.getPortfolioPerformance('user_1');
      expect(result.copy).toBe('Both benchmarks are running ahead of your portfolio today.');
    });

    it('returns ahead-of-NIFTY copy when portfolio beats only NIFTY 50', async () => {
      setupHolding(2.0, 1.0, 3.0); // ahead of NIFTY, behind S&P
      const result = await service.getPortfolioPerformance('user_1');
      expect(result.copy).toBe('You are ahead of NIFTY 50 today.');
    });

    it('returns ahead-of-SP500 copy when portfolio beats only S&P 500', async () => {
      setupHolding(1.0, 2.0, 0.5); // behind NIFTY, ahead of S&P
      const result = await service.getPortfolioPerformance('user_1');
      expect(result.copy).toBe('You are ahead of S&P 500 today.');
    });

    it('returns single-benchmark copy when S&P 500 is unavailable', async () => {
      setupHolding(2.0, 1.0, null); // ahead of NIFTY, S&P unavailable
      const result = await service.getPortfolioPerformance('user_1');
      expect(result.sp500ChangePct).toBeNull();
      expect(result.copy).toBe('You are ahead of NIFTY 50 today.');
    });
  });

  // ─── Resilience ──────────────────────────────────────────────────────────────

  describe('resilience', () => {
    it('returns null portfolioChangePct when getQuotes rejects', async () => {
      mockPrisma.holding.findMany.mockResolvedValue([makeHolding('RELIANCE', 10)]);
      mockProvider.getQuotes.mockRejectedValue(new Error('provider down'));
      mockProvider.getIndexQuote
        .mockResolvedValueOnce(makeIndexQuote('NIFTY 50', 0.4))
        .mockResolvedValueOnce(makeIndexQuote('^GSPC', 0.2));

      const result = await service.getPortfolioPerformance('user_1');

      expect(result.portfolioChangePct).toBeNull();
      expect(result.copy).toBe('Performance data is unavailable right now.');
    });

    it('returns niftyChangePct=0 and still resolves when NIFTY quote rejects', async () => {
      mockPrisma.holding.findMany.mockResolvedValue([]);
      mockProvider.getIndexQuote
        .mockRejectedValueOnce(new Error('NSE down'))
        .mockResolvedValueOnce(makeIndexQuote('^GSPC', 0.3));

      const result = await service.getPortfolioPerformance('user_1');

      expect(result.niftyChangePct).toBe(0);
      expect(result.sp500ChangePct).toBe(0.3);
    });

    it('skips symbols with missing changePct from the weighted average', async () => {
      // RELIANCE has changePct, HDFCBANK does not
      mockPrisma.holding.findMany.mockResolvedValue([
        makeHolding('RELIANCE', 10),
        makeHolding('HDFCBANK', 5),
      ]);
      mockProvider.getQuotes.mockResolvedValue([
        makeQuote('RELIANCE', 2856, 2800, 2),
        { symbol: 'HDFCBANK', ltp: 1620, fetchedAt: new Date() }, // no close, no changePct
      ] as StockQuote[]);
      mockProvider.getIndexQuote
        .mockResolvedValueOnce(makeIndexQuote('NIFTY 50', 0.5))
        .mockResolvedValueOnce(makeIndexQuote('^GSPC', 0.2));

      const result = await service.getPortfolioPerformance('user_1');

      // Only RELIANCE contributes: weight = 10 × 2800 = 28,000; changePct = 2%
      expect(result.portfolioChangePct).toBeCloseTo(2, 5);
    });
  });
});
