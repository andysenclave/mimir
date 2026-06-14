// MarketDataProvider — abstract class used as NestJS injection token.
// Concrete implementations (NseIndiaProvider, YahooFinanceProvider) land in MM-022.
// The mock provider in this file is the Phase 1 dev stand-in.

export interface StockQuote {
  symbol: string;
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

export abstract class MarketDataProvider {
  abstract getQuote(symbol: string): Promise<StockQuote>;
  abstract getQuotes(symbols: string[]): Promise<StockQuote[]>;
}
