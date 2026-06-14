// Mock provider — dev/test stand-in until MM-022 wires real NSE + Yahoo providers.
// Returns plausible-looking but synthetic quotes. Never used in production.

import { Injectable, Logger } from '@nestjs/common';

import { MarketDataProvider, type StockQuote } from './market-data-provider.interface';

// Stable seed prices per symbol so repeated calls stay consistent within a run.
const SEED_PRICES: Record<string, number> = {
  RELIANCE: 2840,
  TCS: 3920,
  HDFCBANK: 1620,
  ICICIBANK: 1240,
  INFY: 1780,
};
const DEFAULT_SEED = 1000;

function seedPrice(symbol: string): number {
  return SEED_PRICES[symbol] ?? DEFAULT_SEED;
}

@Injectable()
export class MockMarketDataProvider extends MarketDataProvider {
  private readonly logger = new Logger(MockMarketDataProvider.name);

  async getQuote(symbol: string): Promise<StockQuote> {
    this.logger.debug(`[mock] getQuote ${symbol}`);
    const base = seedPrice(symbol);
    const jitter = (Math.random() - 0.5) * base * 0.01; // ±0.5%
    const ltp = parseFloat((base + jitter).toFixed(2));
    const change = parseFloat(jitter.toFixed(2));
    const changePct = parseFloat(((jitter / base) * 100).toFixed(4));
    return { symbol, ltp, open: base, high: ltp + 5, low: ltp - 5, close: base, change, changePct, fetchedAt: new Date() };
  }

  async getQuotes(symbols: string[]): Promise<StockQuote[]> {
    return Promise.all(symbols.map((s) => this.getQuote(s)));
  }
}
