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
  indices: IndexQuote[];            // NIFTY 50, SENSEX, BANK NIFTY + global
  topGainers: StockQuote[];         // top 5 by changePct
  topLosers: StockQuote[];          // bottom 5 by changePct
  sectors: SectorPerformance[];     // 10 NSE sectors
  fetchedAt: Date;
}

export abstract class MarketDataProvider {
  abstract getQuote(symbol: string): Promise<StockQuote>;
  abstract getQuotes(symbols: string[]): Promise<StockQuote[]>;
  abstract getMarketOverview(): Promise<MarketOverview>;
  abstract getIndexQuote(indexSymbol: string): Promise<IndexQuote>;
}
