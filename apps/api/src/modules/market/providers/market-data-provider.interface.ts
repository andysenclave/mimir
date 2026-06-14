// MarketDataProvider — abstract class used as NestJS injection token.
// MM-021: getQuote + getQuotes.
// MM-022: extended with getMarketOverview + getIndexQuote.

export interface StockQuote {
  symbol: string;
  name?: string;
  ltp: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  change?: number;
  changePct?: number;
  volume?: number;
  fetchedAt: Date;
}

export interface IndexQuote {
  symbol: string;   // e.g. 'NIFTY 50', '^NSEI'
  name: string;     // display name
  ltp: number;
  change: number;
  changePct: number;
  fetchedAt: Date;
}

export interface SectorPerformance {
  name: string;     // e.g. 'NIFTY BANK', 'NIFTY IT'
  displayName: string; // e.g. 'Banking', 'IT'
  changePct: number;
}

export interface MarketOverview {
  indices: IndexQuote[];            // NIFTY 50, SENSEX, BANK NIFTY
  globalIndices: IndexQuote[];      // S&P 500, NASDAQ — populated by the service
  topGainers: StockQuote[];         // top 5 by changePct
  topLosers: StockQuote[];          // bottom 5 by changePct
  sectors: SectorPerformance[];     // 10 NSE sectors
  fetchedAt: Date;
}

export interface IntradayPoint {
  timestamp: number;  // Unix ms
  price: number;      // INR
}

export abstract class MarketDataProvider {
  abstract getQuote(symbol: string): Promise<StockQuote>;
  abstract getQuotes(symbols: string[]): Promise<StockQuote[]>;
  abstract getMarketOverview(): Promise<MarketOverview>;
  abstract getIndexQuote(indexSymbol: string): Promise<IndexQuote>;
  abstract getIntradayData(symbol: string): Promise<IntradayPoint[]>;

  /**
   * Global indices (S&P 500, NASDAQ). Only some providers support these (Yahoo);
   * the default is empty so NSE-only providers don't have to implement it.
   */
  getGlobalIndices(): Promise<IndexQuote[]> {
    return Promise.resolve([]);
  }
}
