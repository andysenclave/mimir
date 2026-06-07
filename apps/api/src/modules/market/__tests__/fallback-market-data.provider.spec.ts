// Unit tests for FallbackMarketDataProvider — MM-022.
// Tests: primary succeeds, primary fails → fallback, circuit opens after threshold,
// circuit retries after 30s (HALF_OPEN).

import { Test } from '@nestjs/testing';

import { FallbackMarketDataProvider } from '../providers/fallback-market-data.provider';
import { NseIndiaProvider } from '../providers/nse-india.provider';
import { YahooFinanceProvider } from '../providers/yahoo-finance.provider';

import type { StockQuote } from '../providers/market-data-provider.interface';

function makeQuote(symbol: string): StockQuote {
  return { symbol, ltp: 100, fetchedAt: new Date() };
}

const mockNse = { getQuote: jest.fn(), getQuotes: jest.fn(), getIndexQuote: jest.fn(), getMarketOverview: jest.fn() };
const mockYahoo = { getQuote: jest.fn(), getQuotes: jest.fn(), getIndexQuote: jest.fn(), getMarketOverview: jest.fn() };

async function buildProvider(): Promise<FallbackMarketDataProvider> {
  const module = await Test.createTestingModule({
    providers: [
      FallbackMarketDataProvider,
      { provide: NseIndiaProvider, useValue: mockNse },
      { provide: YahooFinanceProvider, useValue: mockYahoo },
    ],
  }).compile();
  return module.get(FallbackMarketDataProvider);
}

describe('FallbackMarketDataProvider', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('primary succeeds', () => {
    it('returns primary result without calling fallback', async () => {
      const quote = makeQuote('RELIANCE');
      mockNse.getQuote.mockResolvedValue(quote);

      const provider = await buildProvider();
      const result = await provider.getQuote('RELIANCE');

      expect(result).toEqual(quote);
      expect(mockNse.getQuote).toHaveBeenCalledTimes(1);
      expect(mockYahoo.getQuote).not.toHaveBeenCalled();
    });
  });

  describe('primary fails once → fallback used', () => {
    it('calls fallback on single primary failure', async () => {
      const fallbackQuote = makeQuote('RELIANCE');
      mockNse.getQuote.mockRejectedValue(new Error('NSE timeout'));
      mockYahoo.getQuote.mockResolvedValue(fallbackQuote);

      const provider = await buildProvider();
      const result = await provider.getQuote('RELIANCE');

      expect(result).toEqual(fallbackQuote);
      expect(mockYahoo.getQuote).toHaveBeenCalledTimes(1);
    });
  });

  describe('circuit breaker — opens after 5 consecutive failures', () => {
    it('stops calling primary once circuit opens, uses fallback directly', async () => {
      mockNse.getQuote.mockRejectedValue(new Error('NSE down'));
      mockYahoo.getQuote.mockResolvedValue(makeQuote('RELIANCE'));

      const provider = await buildProvider();

      // 5 failures → circuit opens
      for (let i = 0; i < 5; i++) {
        await provider.getQuote('RELIANCE');
      }

      jest.clearAllMocks();
      mockYahoo.getQuote.mockResolvedValue(makeQuote('RELIANCE'));

      // Circuit is now OPEN — primary should not be called
      await provider.getQuote('RELIANCE');

      expect(mockNse.getQuote).not.toHaveBeenCalled();
      expect(mockYahoo.getQuote).toHaveBeenCalledTimes(1);
    });
  });

  describe('circuit breaker — HALF_OPEN after 30s', () => {
    it('probes primary again after retry window, closes circuit on success', async () => {
      mockNse.getQuote.mockRejectedValue(new Error('NSE down'));
      mockYahoo.getQuote.mockResolvedValue(makeQuote('RELIANCE'));

      const provider = await buildProvider();

      // Open the circuit
      for (let i = 0; i < 5; i++) {
        await provider.getQuote('RELIANCE');
      }

      // Simulate 30s passing by manipulating openedAt via Date.now mock
      const realNow = Date.now;
      Date.now = jest.fn(() => realNow() + 31_000);

      jest.clearAllMocks();
      mockNse.getQuote.mockResolvedValue(makeQuote('RELIANCE')); // primary recovers
      mockYahoo.getQuote.mockResolvedValue(makeQuote('RELIANCE'));

      const result = await provider.getQuote('RELIANCE');

      // Primary should have been probed (HALF_OPEN)
      expect(mockNse.getQuote).toHaveBeenCalledTimes(1);
      expect(mockYahoo.getQuote).not.toHaveBeenCalled();
      expect(result.symbol).toBe('RELIANCE');

      Date.now = realNow; // restore
    });
  });
});
