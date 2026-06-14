// YahooFinanceProvider — fallback market data source using yahoo-finance2.
// MM-022. NSE stocks use `.NS` suffix. Used when NSE India API is unavailable.

import { Injectable } from '@nestjs/common';
import YahooFinance from 'yahoo-finance2';

import {
  MarketDataProvider,
  type IndexQuote,
  type IntradayPoint,
  type MarketOverview,
  type SectorPerformance,
  type StockQuote,
} from './market-data-provider.interface';

// Minimal quote shape we consume — avoids the conditional `never` return type
// from yahoo-finance2's overloaded quote() when called without a `fields` array.
interface YahooQuote {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketPreviousClose?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
}

// Yahoo Finance symbols for NSE indices.
const YAHOO_INDEX_MAP: ReadonlyArray<{ yahoo: string; name: string; nseKey: string }> = [
  { yahoo: '^NSEI',    name: 'NIFTY 50',   nseKey: 'NIFTY 50'   },
  { yahoo: '^NSEBANK', name: 'BANK NIFTY', nseKey: 'NIFTY BANK' },
  { yahoo: '^BSESN',   name: 'SENSEX',     nseKey: 'SENSEX'      },
];

// Global indices shown in the "Global Markets" section (MM-077).
const YAHOO_GLOBAL_MAP: ReadonlyArray<{ yahoo: string; name: string }> = [
  { yahoo: '^GSPC', name: 'S&P 500' },
  { yahoo: '^IXIC', name: 'NASDAQ' },
];

const YAHOO_SECTOR_MAP: ReadonlyArray<{ yahoo: string; name: string; displayName: string }> = [
  { yahoo: '^NSEBANK',   name: 'NIFTY BANK',   displayName: 'Banking' },
  { yahoo: '^CNXIT',     name: 'NIFTY IT',     displayName: 'IT'      },
  { yahoo: '^CNXPHARMA', name: 'NIFTY PHARMA', displayName: 'Pharma'  },
  { yahoo: '^CNXAUTO',   name: 'NIFTY AUTO',   displayName: 'Auto'    },
  { yahoo: '^CNXFMCG',   name: 'NIFTY FMCG',  displayName: 'FMCG'    },
  { yahoo: '^CNXMETAL',  name: 'NIFTY METAL',  displayName: 'Metals'  },
  { yahoo: '^CNXREALTY', name: 'NIFTY REALTY', displayName: 'Realty'  },
  { yahoo: '^CNXENERGY', name: 'NIFTY ENERGY', displayName: 'Energy'  },
  { yahoo: '^CNXINFRA',  name: 'NIFTY INFRA',  displayName: 'Infra'   },
  { yahoo: '^CNXMEDIA',  name: 'NIFTY MEDIA',  displayName: 'Media'   },
];

@Injectable()
export class YahooFinanceProvider extends MarketDataProvider {
  // yahoo-finance2 v3 dropped the ready-made default singleton — the default
  // export is now the client class and MUST be instantiated. Build one per
  // provider instance. suppressNotices silences the library's startup banner.
  private readonly yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

  async getQuote(symbol: string): Promise<StockQuote> {
    const yahooSymbol = this.toYahooSymbol(symbol);
    const q = (await this.yf.quote(yahooSymbol)) as unknown as YahooQuote;
    return this.mapQuote(symbol, q);
  }

  async getQuotes(symbols: string[]): Promise<StockQuote[]> {
    const yahooSymbols = symbols.map((s) => this.toYahooSymbol(s));
    const raw = (await this.yf.quote(yahooSymbols)) as unknown as YahooQuote | YahooQuote[];
    const quotes = Array.isArray(raw) ? raw : [raw];
    return quotes.map((q, i) => this.mapQuote(symbols[i] ?? q.symbol, q));
  }

  async getIndexQuote(indexSymbol: string): Promise<IndexQuote> {
    const entry = YAHOO_INDEX_MAP.find((m) => m.nseKey === indexSymbol || m.yahoo === indexSymbol);
    const yahooSymbol = entry?.yahoo ?? indexSymbol;
    const q = (await this.yf.quote(yahooSymbol)) as unknown as YahooQuote;
    return {
      symbol: indexSymbol,
      name: entry?.name ?? q.shortName ?? indexSymbol,
      ltp: q.regularMarketPrice ?? 0,
      change: q.regularMarketChange ?? 0,
      changePct: q.regularMarketChangePercent ?? 0,
      fetchedAt: new Date(),
    };
  }

  async getGlobalIndices(): Promise<IndexQuote[]> {
    const results = await Promise.allSettled(
      YAHOO_GLOBAL_MAP.map(async (m) => {
        const q = (await this.yf.quote(m.yahoo)) as unknown as YahooQuote;
        return {
          symbol: m.yahoo,
          name: m.name,
          ltp: q.regularMarketPrice ?? 0,
          change: q.regularMarketChange ?? 0,
          changePct: q.regularMarketChangePercent ?? 0,
          fetchedAt: new Date(),
        } satisfies IndexQuote;
      }),
    );
    return results
      .filter((r): r is PromiseFulfilledResult<IndexQuote> => r.status === 'fulfilled')
      .map((r) => r.value);
  }

  async getMarketOverview(): Promise<MarketOverview> {
    const [indicesResults, sectorResults] = await Promise.all([
      Promise.allSettled(YAHOO_INDEX_MAP.map((m) => this.getIndexQuote(m.nseKey))),
      Promise.allSettled(YAHOO_SECTOR_MAP.map((s) => this.getIndexQuote(s.yahoo))),
    ]);

    const indices = indicesResults
      .filter((r): r is PromiseFulfilledResult<IndexQuote> => r.status === 'fulfilled')
      .map((r) => r.value);

    const sectors: SectorPerformance[] = sectorResults
      .map((r, i) => {
        const entry = YAHOO_SECTOR_MAP[i];
        if (!entry || r.status === 'rejected') return null;
        return { name: entry.name, displayName: entry.displayName, changePct: r.value.changePct };
      })
      .filter((s): s is SectorPerformance => s !== null);

    return { indices, globalIndices: [], topGainers: [], topLosers: [], sectors, fetchedAt: new Date() };
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  private toYahooSymbol(symbol: string): string {
    return symbol.includes('.') || symbol.startsWith('^') ? symbol : `${symbol}.NS`;
  }

  // Yahoo Finance intraday via chart() endpoint (1m intervals, today onward).
  // v3 replaced the v2 `range` option with `period1`/`period2`.
  async getIntradayData(symbol: string): Promise<IntradayPoint[]> {
    try {
      const yahooSymbol = this.toYahooSymbol(symbol);
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const result = (await this.yf.chart(yahooSymbol, {
        interval: '1m',
        period1: startOfDay,
      })) as unknown as { quotes?: Array<{ date: unknown; close: unknown }> };
      const quotes = result?.quotes ?? [];
      return quotes
        .filter((q) => q.date != null && q.close != null)
        .map((q) => ({
          timestamp: new Date(q.date as string).getTime(),
          price: q.close as number,
        }));
    } catch {
      return [];
    }
  }

  private mapQuote(symbol: string, q: YahooQuote): StockQuote {
    return {
      symbol,
      name: q.shortName ?? q.longName,
      ltp: q.regularMarketPrice ?? 0,
      open: q.regularMarketOpen,
      high: q.regularMarketDayHigh,
      low: q.regularMarketDayLow,
      close: q.regularMarketPreviousClose,
      change: q.regularMarketChange,
      changePct: q.regularMarketChangePercent,
      volume: q.regularMarketVolume,
      fetchedAt: new Date(),
    };
  }
}
