// Mock provider — dev/test stand-in until MM-022 wires real NSE + Yahoo providers.
// Returns plausible-looking but synthetic quotes. Never used in production.

import { Injectable, Logger } from '@nestjs/common';

import {
  MarketDataProvider,
  type IndexQuote,
  type IntradayPoint,
  type MarketOverview,
  type StockQuote,
} from './market-data-provider.interface';

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

  async getIndexQuote(indexSymbol: string): Promise<IndexQuote> {
    this.logger.debug(`[mock] getIndexQuote ${indexSymbol}`);
    return { symbol: indexSymbol, name: indexSymbol, ltp: 22000, change: 100, changePct: 0.45, fetchedAt: new Date() };
  }

  async getIntradayData(symbol: string): Promise<IntradayPoint[]> {
    this.logger.debug(`[mock] getIntradayData ${symbol}`);
    const base = seedPrice(symbol);
    const now = Date.now();
    // 78 points = 9:15 to 15:30 at 5-min intervals
    return Array.from({ length: 78 }, (_, i) => {
      const jitter = (Math.random() - 0.5) * base * 0.005;
      return { timestamp: now - (78 - i) * 5 * 60_000, price: parseFloat((base + jitter).toFixed(2)) };
    });
  }

  async getMarketOverview(): Promise<MarketOverview> {
    this.logger.debug('[mock] getMarketOverview');
    const indices: IndexQuote[] = [
      { symbol: 'NIFTY 50', name: 'NIFTY 50', ltp: 22000, change: 100, changePct: 0.45, fetchedAt: new Date() },
      { symbol: 'NIFTY BANK', name: 'BANK NIFTY', ltp: 48000, change: -200, changePct: -0.41, fetchedAt: new Date() },
      { symbol: 'SENSEX', name: 'SENSEX', ltp: 72000, change: 250, changePct: 0.35, fetchedAt: new Date() },
    ];
    const sectors = [
      { name: 'NIFTY BANK', displayName: 'Banking', changePct: -0.41 },
      { name: 'NIFTY IT', displayName: 'IT', changePct: 1.2 },
      { name: 'NIFTY PHARMA', displayName: 'Pharma', changePct: 0.8 },
      { name: 'NIFTY AUTO', displayName: 'Auto', changePct: -0.3 },
      { name: 'NIFTY FMCG', displayName: 'FMCG', changePct: 0.5 },
      { name: 'NIFTY METAL', displayName: 'Metals', changePct: 1.5 },
      { name: 'NIFTY REALTY', displayName: 'Realty', changePct: -1.2 },
      { name: 'NIFTY ENERGY', displayName: 'Energy', changePct: 0.2 },
      { name: 'NIFTY INFRA', displayName: 'Infra', changePct: 0.6 },
      { name: 'NIFTY MEDIA', displayName: 'Media', changePct: -0.8 },
    ];
    const fetchedAt = new Date();
    return { indices, globalIndices: [], topGainers: [], topLosers: [], sectors, fetchedAt };
  }

  async getGlobalIndices(): Promise<IndexQuote[]> {
    this.logger.debug('[mock] getGlobalIndices');
    const fetchedAt = new Date();
    return [
      { symbol: '^GSPC', name: 'S&P 500', ltp: 5248.3, change: 32.4, changePct: 0.62, fetchedAt },
      { symbol: '^IXIC', name: 'NASDAQ', ltp: 16742.8, change: 188.5, changePct: 1.14, fetchedAt },
    ];
  }
}
